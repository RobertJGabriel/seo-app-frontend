'use strict';

const getSEOReportURL = 'https://seo-bot-.herokuapp.com/';





const vm = new Vue({
  el: '#app',
  data: {
    features: [],
    notSupport: [],
    loading: null,
    error: false,
    success: false,
    emailAddress: '',
    forwordOpen: false,
    errorMessage: '',
    successMessage: '',
    email: '',
    license: null,
    URL: ''
  },

  methods: {
    updateURL: function updateURL(arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      this.URL = activeTab.url;
    },
    updateLicense: function updateLicense(result) {
      this.license = result.license;

    },
    goHome() {
      this.features = [];
      this.loading = null;
      this.success = false;
      this.error = false;
    },
    share() {
      const opened = this.forwordOpen;
      if (opened) {
        this.forwordOpen = false;
      } else {
        this.forwordOpen = true;
      }
    },
    goTo(URL) {
      console.log(URL);
      const win = window.open(URL);
      win.focus();
    },
    validateUrl(url) {
      const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
      return regexp.test(url);
    },
    validateEMAIL(email) {
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(email);
    },
    removeDuplicates(arr) {
      const unique_array = [];
      for (let i = 0; i < arr.length; i++) {
        if (unique_array.indexOf(arr[i]) == -1) {
          unique_array.push(arr[i]);
        }
      }
      return unique_array;
    },
    sortFeatures(features) {
      for (let i = 0; i < features.length; i++) {
        const obj = features[i];
        if (!obj.supported) {
          console.log(obj.name);
          this.notSupport.push(obj.name);
        }
      }
      this.notSupport = this.removeDuplicates(this.notSupport);
    },
    sendEmailReport(event) {
      this.error = false;
      this.success = false;
      this.sortFeatures(this.features);
      const encodedEmail = encodeURI(this.email); // Encode the url to https safe.

      if (this.notSupport.length == 0 || this.notSupport === undefined) {
        this.error = true;
        this.errorMessage = 'Theres no errors to send woooooooo!';
        return false;
      }

      if (event.key != 'Enter') {
        return false;
      }

      if (this.validateEMAIL(this.email) == false || this.email == '') {
        this.errorMessage = 'Please enter a valid email';
        this.error = true;
        this.loading = false;
        return false;
      }

      this.loading = true;

      const object = {
        email: this.email,
        url: this.URL,
        notSupport: this.notSupport
      };

      this.$http
        .post(`${getSEOReportURL}email?email=${encodedEmail}`, object)
        .then(
          response => {
            this.success = true;
            this.successMessage = `Report sent to ${this.email}`;
            this.loading = false;
          },
          response => {
            this.error = true;
            this.loading = null;
            this.errorMessage = `Something went wrong sending the email report to ${
              this.email
            }`;
          }
        );
    },
    getSEOReport(event) {
      this.error = false; // Set the error to false.
      this.features = []; // Clear features

      const encodedURL = encodeURI(this.URL); // Encode the url to https safe.

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

      this.$http.get(`${getSEOReportURL}results?name=${encodedURL}`).then(
        response => {
          this.features = JSON.parse(response.bodyText).features.css; // Parse the coffee lists
          this.loading = false;
        },
        response => {
          this.error = true;
          this.loading = null;
          this.features = [];
          this.errorMessage =
            'Opps, something seems to have gone wrong. Please try again';
        }
      );
    }
  }
});

// Set config settings
Vue.config.productionTip = false;
Vue.config.devtools = false;

chrome.tabs.query({
    active: true,
    currentWindow: true
  },
  vm.updateURL.bind(this)
);

chrome.storage.sync.get(['license'], vm.updateLicense.bind(this));