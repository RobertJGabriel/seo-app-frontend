'use strict';


const getSEOReportURL = 'https://seo-bot-.herokuapp.com/results';

var vm = new Vue({
  el: '#app',
  data: {
    features: [],
    loading: null,
    error: false,
    errorMessage: '',
    input: ''
  },

  methods: {
    updateURL: function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      this.input = activeTab.url;
    },
    goHome: function () {
      this.features = [];
      this.loading = null;
    },
    goTo: function (URL) {
      console.log(URL);
      var win = window.open(URL);
      win.focus();
    },
    validateUrl: function (value) {
      var regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
      return regexp.test(value);
    },
    getSEOReport: function (event) {

      this.error = false; // Set the error to false.
      this.features = []; // Clear features

      let encodedInput = encodeURI(this.input); // Encode the url to https safe.

      if (this.loading || this.input == '' || event.key != 'Enter') {
        return false;
      }

      if (this.validateUrl(this.input) == false) {
        this.errorMessage = 'Please enter a valid URL';
        this.error = true;
        this.loading = null;
        return false;
      }

      this.loading = true;

      this.$http.get(`${getSEOReportURL}?name=${encodedInput}`).then(response => {
        this.features = JSON.parse(response.bodyText).features.css; // Parse the coffee lists
        this.loading = false;
      }, response => {
        this.error = true;
        this.loading = null;
        this.features = [];
        this.errorMessage = 'Opps, something seems to have gone wrong. Please try again';
      });
    }
  }
});

// Set config settings
Vue.config.productionTip = false;
Vue.config.devtools = false


chrome.tabs.query({
  active: true,
  currentWindow: true
}, vm.updateURL.bind(this));