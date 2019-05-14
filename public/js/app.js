/**
 * Application
 */
class App {

    /**
     * Constructor
     * @return {App}
     */
    constructor(){
        let self = this;
        // elements
        this.wrapper = document.getElementById('app');
        this.loader = document.getElementById('loader');
        // components
        this.chat = new Chat();
        this.chat.initialize();
        return this;
    }

    /**
     * Initialize all components
     * @return {App}
     */
    initialize(){
        // setTimeout(() => {
            this.login.initialize();
        // }, 1800)
        return this;
    }
}

let app = new App();
app.initialize();