define([
    'Backbone',
    'Underscore',
    'text!templates/restorePasswordpage2.html'
], function (
    Backbone,
    _,
    temp
) {
    var RestorePageView = Backbone.View.extend({
        el: '#login-block',
        template: _.template(temp),

        initialize: function (){
            this.render();
        },

        events: {
            'click #rest': 'sendResPass'
        },

        //checking passwords and send passwords to server for change
        sendResPass: function() {
            this.model.urlRoot = function () {
                return '/sendRestore/change/'
            };

            var $pass1 = $('#pass1').val();
            var $pass2 = $('#pass2').val();

            console.log($pass1);

            if ($pass1 == $pass2) {
                this.model.save({
                    pass: $pass1
                },{
                    success: function () {
                        console.log('password is change!');
                    }
                });
            }
        },

        render: function () {
            this.$el.append(this.template());

            return this
        }
    });

    return RestorePageView
});

