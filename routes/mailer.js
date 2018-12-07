var express = require('express');
var router = express.Router();
var db = require("../database");

/*GET mailer listing*/
router.get('/', function(req, res) {
    res.render('mailer', {});
});

router.get('/mailer', function(req, res) {
    res.redirect('/mailer');
});

router.get('/contacts', function(req, res) {
    res.redirect('/contacts');
});


/*Invoke when user posts new contact details*/
router.post('/posted', function(req, res) {

    var postData = req.body;

    var honorifics = postData.honorifics,
        firstName = postData.userFirstName,
        lastName = postData.userLastName,
        street = postData.streetName,
        city = postData.cityName,
        state = postData.selectState,
        zip = postData.zipCode,
        phoneValue = postData.phoneNo,
        emailValue = postData.userEmail;

    var contactMedium = postData.WayToContact;

    //check for values user has provided in the checkboxes 
    var phoneInArray = (contactMedium.indexOf('Phone') > -1);
    var emailInArray = (contactMedium.indexOf('Email') > -1);
    var mailInArray = (contactMedium.indexOf('Mail') > -1);
    var anyInArray = (contactMedium.indexOf('Any') > -1);

    //store the states of the user's contact medium
    var mail = "No",
        email = "No",
        phone = "No";

    //user checked any; combination of phone, email, mail and any
    //also fall into this category
    if (anyInArray) {
        mail = "Yes";
        email = "Yes";
        phone = "Yes";
    }
    //user checked phone, email, mail but unchecked any
    else if (phoneInArray && emailInArray && mailInArray) {
        mail = "Yes";
        email = "Yes";
        phone = "Yes";
    }
    //user checked mail only
    else if (mailInArray && !emailInArray && !phoneInArray) {
        mail = "Yes";
        email = "No";
        phone = "No";
    }
    //user checked email only
    else if (!mailInArray && emailInArray && !phoneInArray) {
        mail = "No";
        phone = "No";
        email = "Yes";
    }
    //user checked phone only
    else if (!mailInArray && !emailInArray && phoneInArray) {
        mail = "No";
        email = "No";
        phone = "Yes";
    }
    //user checked mail and email but unchecked phone
    else if (mailInArray && emailInArray && !phoneInArray) {
        mail = "Yes";
        email = "Yes";
        phone = "No";
    }
    //user checked mail and phone but unchecked email
    else if (mailInArray && !emailInArray && phoneInArray) {
        mail = "Yes";
        email = "No";
        phone = "Yes";
    }
    //user checked email and phone but unchecked mail
    else if (!mailInArray && emailInArray && phoneInArray) {
        mail = "No";
        email = "Yes";
        phone = "Yes";
    }

    //store the contact information of an object
    var contactArray = [];

    //push the contact information to the local array
    contactArray.push(honorifics, firstName, lastName, street, city, state, zip, phoneValue, emailValue, phone, mail, email);

    //add the array to our database collection
    db.addContact(contactArray, function(err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.render('submitted', {});
    });
});

router.get('/submitted', function(req, res, next) {
    res.render('submitted', {});
});

module.exports = router;