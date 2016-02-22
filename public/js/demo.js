(function(){
    //namespace

    window.App = {
        Models: {},
        Views: {},
        Collections: {},
        Router: {},
        Functions: {},
        Properties: {}
    };

    //template helper

    window.template = function(id) {
        return _.template($('#' + id).html());
    };

    //--------------------
    //-----FUNCTIONS------
    //--------------------
    App.Functions.showUsers = function() {
            if (App.Properties.valid.get('userIsAuthorised')) {
                $('#posts').hide().html('');
                $('#containerHeader').show();
                $('#containerHeaderBlock').html('');
                $('#register-block').hide().html('');
                $('#login-block').hide().html('');
                $('#welcomeBlock').hide();
                $('#signOutBut').show();
                $('#signBut').hide();
                $('#regBut').hide();
                App.Properties.userView.render();
            } else {
                router.navigate('#main');
            }
    };

    App.Functions.init = function() {
        App.Properties.userCol = new App.Collections.UserPages();

        App.Properties.valid = new App.Models.UserLogValid();

        App.Properties.userView = new App.Views.UserPages({model: App.Properties.userCol});

        regForm = new App.Views.RegisterPage({model: App.Properties.userCol});

        loginForm = new App.Views.LoginPage();

        router = new App.Router;
    };


    App.Functions.userIsValid = function(){
        //setInterval(function() {
            App.Properties.valid.fetch({
                success: function(response) {
                    console.log("JSON val = ", response.toJSON().val);
                    App.Properties.valid.set('userIsAuthorised', response.toJSON().val)
                    App.Properties.valid.set('userId', response.toJSON().userId)
                }
            });
        //}, 1000);
    };

    App.Functions.loadModels = function(id) {
        if (!App.Properties.newUserCol || (!App.Properties.newUserCol.where({_id: id})[0])) {
            App.Properties.newUserCol = new App.Collections.UserPages();
            App.Properties.newUserCol.fetch({
                success: function(){
                    console.log('Successfully load with blog!');
                    console.log(App.Properties.newUserCol);
                    return App.Properties.newUserCol;
                },
                error: function(){
                    console.log('Failed to get blog');
                }
            });
        } else {
            return App.Properties.newUserCol;
        }

    };

    App.Functions.showOneUser = function(id) {
        App.Functions.userIsValid();
        //router.navigate('/checkInUser/' + id);
        $('#posts').hide();
        $('#register-block').hide();
        $('#login-block').hide();
        $('#welcomeBlock').hide();
        $('#signOutBut').show();
        $('#signBut').hide();
        $('#regBut').hide();
        //$('#users').hide();
        App.Functions.loadModels(id);
        setTimeout(function(){
            var loadColl = App.Functions.loadModels(id);
            console.log(loadColl);
            if (loadColl) {
                console.log("id = ", id);
                console.log("colFull = ",loadColl);
                console.log("col = ",loadColl.where({_id: id})[0]);
                App.Properties.valid.set('userId', loadColl.where({_id: id})[0]);
                App.Properties.valid.set('userIsAuthorised', true);
                var userView = new App.Views.NewUserPage({model: loadColl.where({_id: id})[0]});
                $('#containerHeader').show();
                $('#containerHeaderBlock').html(template('mainHeader'));
                $('#forUsersHeader').append(userView.render().el);
                App.Properties.ourUser = id;
            } else {
                console.log("User else not load")
            }
        }, 50);



    };

    App.Functions.clearRegForm = function() {
        $('#editUsernameReg').val('');
        $('#editPasswordReg').val('');
        $('#editConfirmPasswordReg').val('');
        $('#editEmailReg').val('');
        $('#editBirthdayReg').val('1990-01-01');
        $('#editAddressReg').val('');
    };

    App.Functions.clearLogForm = function() {
        $('#editUsernameLog').val('');
        $('#editPasswordLog').val('');
    };


    //--------------------
    //-------MODELS-------
    //--------------------


    Backbone.Model.prototype.idAttribute = "_id";

    App.Models.Post = Backbone.Model.extend({
        defaults: {
            title: "new Post",
            content: "empty",
            image: ""
        }
    });

    App.Models.UserLogValid = Backbone.Model.extend({
        defaults:{
            userIsAuthorised: false
        },
        url: "http://localhost:3060/userIsValid"
    });

    App.Models.UserLog = Backbone.Model.extend({
        url: "http://localhost:3060/userLog",
        validate: function(attr) {
            if ((!attr.username) || (attr.username.length < 3)) {
                return "Length username must be more at 3 symbols"
            }
        }
    });
    //I`m deleted default data
    App.Models.UserPage = Backbone.Model.extend({
        validate: function(attr){
            if ((!attr.username) || (attr.username.length < 3)) {
                return "Length username must be more at 3 symbols"
            }
           if ((!attr.email) || (attr.email.length <= 5) || (attr.email.search("@") == -1) || (attr.email.search('.') == -1)){
                return "Invalid Email!"
            }
        }
    });


    //--------------------
    //----COLLECTIONS-----
    //--------------------

    App.Collections.UserPages = Backbone.Collection.extend({
        url: "http://localhost:3060/users",
        model: App.Models.UserPage
    });

    // userCol = new App.Collections.UserPages();

    App.Collections.Posts = Backbone.Collection.extend({
        url: "http://localhost:3060/posts",
        model: App.Models.Post
    });

    //--------------------
    //-------VIEWS--------
    //-------LOGIN--------
    //--------------------
    App.Views.NewLogin = Backbone.View.extend({
        model: new App.Collections.UserPages,
        template: template("login"),
        events: {
            'click #signInButton': 'sendFormLog'
        },
        initialize: function(){
            this.render();
        },
        render: function(){
            this.$el.html(this.template());
            return this
        },
        sendFormLog: function() {
            console.log('send form login');
            var compResult = 1;
            user = new App.Models.UserLog();
            user.set('username', $('#editUsernameLog').val());
            console.log('inputUsername => ', $('#editUsernameLog').val());
            if ($('#editPasswordLog').val().length > 6) {
                console.log("passwordTrue => ", $('#editPasswordLog').val());
                user.set('password', $('#editPasswordLog').val(), {validate: true});
            } else {
                compResult = 0;
            }
            console.log('inputPassword => ', $('#editPasswordLog').val());
            if (user.isValid() && compResult){
                user.save(null, {
                    success: function(response) {
                        console.log("Successfully Save Data!))) with id " + response.toJSON()._id);
                        console.log("username this user is " + response.toJSON().username);
                        console.log("address this user is " + response.toJSON().address);
                        router.navigate('/connected_user/' + response.toJSON()._id, {trigger: true});
                    },
                    error: function(){
                        console.log("Failed Save data((((")
                    }
                });
            } else if(!compResult) {
                $('#errorLabLog').html("password must be more at 6 symbols!");
            } else {
                $('#errorLabLog').html(user.validationError);
            }

            //new App.Models.UserPage({model: user});

            //ourUser = App.Models.UserPage();


            App.Functions.clearLogForm();
            compResult = 1;
        }


    });

    App.Views.LoginPage = Backbone.View.extend({
        el: '#global',
        //el: $('#login-block'),

        events: {initialize: function(){
            console.log(this.el);
        },
            'click #signBut': 'showForm'
        },
        render: function() {
            var userView = new App.Views.NewLogin();
            $('#login-block').append(userView.render().el);
        }

    });

    //--------------------
    //-------VIEWS--------
    //------REGISTER------
    //--------------------
    App.Views.NewRegister = Backbone.View.extend({
        //model: userCol,
        template: template("register"),
        initialize: function(){
            this.render();
        },
        events: {
            'click #registerButton': 'sendFormReg'
        },
        render: function(){
            console.log(this.$el);
            this.$el.html(this.template());
            return this
        },

        sendFormReg: function() {
            var compResult = 1;
            console.log("sendForm");
            user = new App.Models.UserPage();
            user.set('username', $('#editUsernameReg').val());
            if (($('#editPasswordReg').val()) == ($('#editConfirmPasswordReg').val()) && ($('#editPasswordReg').val().length > 6)) {
                console.log("passwordTrue => ", $('#editPasswordReg').val());
                user.set('password', $('#editPasswordReg').val());
            } else {
                compResult = 0;
                console.log("passwordFalse => ", $('#editPasswordReg').val());
                user.set('password', $('#editPasswordReg').val());
            }
            user.set('email', $('#editEmailReg').val(),{validate: true});
            console.log("email => ", $('#editEmailReg').val());
            user.set('birthday', $('#editBirthdayReg').val(), {validate: true});
            console.log("birthday => ", $('#editBirthdayReg').val());
            user.set('address', $('#editAddressReg').val(), {validate: true});
            console.log("address => ", $('#editAddressReg').val());


            console.log(user.validationError);
            console.log("isValid?? " ,user.isValid());
            console.log(user.toJSON());
            if (user.isValid() && compResult){
                this.collection.add(user);
                user.save(null, {
                    success: function(response) {
                        router.navigate('#main', {trigger: true});
                        console.log("Successfully Save Data!))) with id " + response.toJSON()._id);
                        compResult = 1;
                    },
                    error: function(){
                        console.log("Failed Save data((((")
                        compResult = 1;
                    }
                });
            } else if(!compResult) {
                console.log("passwords is not comfirm!");
                compResult = 1;
                $('#errorLab').html("password must be confirm and more at 6 symbols!");
            } else {
                console.log(user.validationError);
                $('#errorLab').html(user.validationError);
                compResult = 1;
            }
            App.Functions.clearRegForm();

        }
    });



    App.Views.RegisterPage = Backbone.View.extend({
        //model: usersCol,
        el: '#global',
        //el: $('#login-block'),
        initialize: function(){
            console.log(this.el);
        },
        events: {
            'click #regBut': 'showForm'
        },
        render: function() {
            var registerView = new App.Views.NewRegister({collection: this.model});
            $('#register-block').append(registerView.render().el);
        }
    });


    //--------------------
    //-------VIEWS--------
    //-------USER---------
    //--------------------

    App.Views.NewUserPage = Backbone.View.extend({
        tagName: "li",
        template: template("user"),
        initialize: function(){
            this.render();
        },
        render: function(){
            console.log("el = ", this.$el);
            this.$el.html(this.template(this.model.toJSON()));
            return this
        }
    });

    App.Views.UserPages = Backbone.View.extend({
        //model: userCol,
        el: $('#containerHeaderBlock'),
        initialize: function() {
            console.log(this.collection);
            this.model.fetch({
                success: function(response){
                    _.each(response.toJSON(),
                        function(item){
                            console.log("Successfully GET blog with id " + item._id);
                            $('#containerHeaderBlock').html("");
                            App.Properties.userView.render();
                        });
                },
                error: function(){
                    console.log('Failed to get blogs');
                }
            });
            console.log("mod = ", this.model.toJSON())
        },
        render: function() {
            this.model.each(function(myModel) {
                var userView = new App.Views.NewUserPage({model:myModel});
                this.$el.append(userView.render().el);
            }, this);
        }
    });

    //--------------------
    //-------VIEWS--------
    //-------POST---------
    //--------------------

    App.Views.NewPost = Backbone.View.extend({
        tagName: "li",
        template: template("post"),
        initialize: function(){
            this.render();
        },
        render: function(){
            console.log("el = ", this.$el);
            this.$el.html(this.template(this.model.toJSON()));
            return this
        }
    });

    App.Views.Posts = Backbone.View.extend({
        el: '#posts',
        initialize: function() {
            console.log(this.collection);
            this.render();
        },
        render: function() {
            this.collection.each(function(myModel) {
                var postView = new App.Views.NewPost({model:myModel});
                this.$el.append(postView.render().el);
            }, this);
        }
    });


    //--------------------
    //------ROUTERS-------
    //--------------------

    App.Router = Backbone.Router.extend({
        routes: {
            '': 'main',
            'main': 'main',
            'logOut': 'main',
            'showUsers': 'showUsers',
            'register': 'register',
            'login': 'login',
            'connected_user/:id': 'connUser'
        },
        main: function() {
            App.Functions.userIsValid();
            if (!App.Properties.valid.get('userIsAuthorised')) {
                $('#posts').hide().html('');
                $('#register-block').hide().html('');
                $('#login-block').hide().html('');
                $('#welcomeBlock').html('').show().append(template('welcome'));
                $('#signOutBut').hide();
                $('#signBut').show();
                $('#regBut').show();
                $('#containerHeader').hide();
                App.Properties.ourUser = 0;
            } else {
                router.navigate('/connected_user/' + App.Properties.valid.get('userId'), {trigger: true});
            }
        },
        showUsers: function() {
            App.Functions.userIsValid();
            console.log("i am get!", App.Properties.valid.get('userIsAuthorised'));
            setTimeout(App.Functions.showUsers, 10);
        },
        register: function() {
            App.Functions.userIsValid();
            if (!App.Properties.valid.get('userIsAuthorised')) {
                $('#posts').hide().html('');
                $('#register-block').show();
                $('#login-block').hide().html('');
                $('#welcomeBlock').hide();
                $('#containerHeader').hide();
                $('#signOutBut').hide();
                $('#signBut').show();
                $('#regBut').show();
                regForm.render();
            } else {
                router.navigate('#main');
            }
        },
        login: function() {
            App.Functions.userIsValid();
            if (!App.Properties.valid.get('userIsAuthorised')) {
                $('#welcomeBlock').hide();
                $('#posts').hide().html('');
                $('#containerHeader').hide();
                $('#register-block').hide().html('');
                $('#login-block').show();
                $('#signOutBut').hide();
                $('#signBut').show();
                $('#regBut').show();
                loginForm.render();
            } else {
                router.navigate('#main');
            }
        },
        connUser: function(id){
            App.Functions.showOneUser(id);
        }
    });

    //--------------------
    //----INITIALIZE------
    //--------------------

    App.Functions.init();
    Backbone.history.start();

})();