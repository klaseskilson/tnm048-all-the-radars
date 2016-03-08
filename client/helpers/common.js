Template.registerHelper('session', key => Session.get(key));
Template.registerHelper('debugger', () => { debugger });
Template.registerHelper('icon', icon => Spacebars.SafeString(`<span class="fa fa-${icon}"></span>`));
