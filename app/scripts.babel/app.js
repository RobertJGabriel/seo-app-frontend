'use strict';


const getSEOReportURL = 'https://seo-bot-.herokuapp.com/results';

var vm = new Vue({
  el: '#app',
  data: {
    features: [],
    loading: null,
    error: false,
    success: false,
    emailAddress: '',
    forwordOpen: false,
    errorMessage: '',
    successMessage: '',
    email: '',
    URL: ''
  },

  methods: {
    updateURL: function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      this.URL = activeTab.url;
    },
    goHome: function () {
      this.features = [];
      this.loading = null;
    },
    share: function () {
      var opened = this.forwordOpen;
      if (opened) {
        this.forwordOpen = false;
      } else {
        this.forwordOpen = true;
      }

    },
    goTo: function (URL) {
      console.log(URL);
      var win = window.open(URL);
      win.focus();
    },
    validateUrl: function (url) {
      var regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
      return regexp.test(url);
    },
    validateEMAIL: function (email) {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(email);
    },
    sendEmailReport: function (event) {

      this.error = false;
      if (this.email == '' || event.key != 'Enter') {
        return false;
      }

      if (this.validateEMAIL(this.email) == false) {
        this.errorMessage = 'Please enter a valid email';
        this.error = true;
        this.loading = false;
        return false;
      }
    },
    getSEOReport: function (event) {

      this.error = false; // Set the error to false.
      this.features = []; // Clear features

      let encodedURL = encodeURI(this.URL); // Encode the url to https safe.

      if (this.loading || this.URL == '' || event.key != 'Enter') {
        return false;
      }

      if (this.validateUrl(this.URL) == false) {
        this.errorMessage = 'Please enter a valid URL';
        this.error = true;
        this.loading = null;
        return false;
      }

      this.loading = true;

      this.$http.get(`${getSEOReportURL}?name=${encodedURL}`).then(response => {
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