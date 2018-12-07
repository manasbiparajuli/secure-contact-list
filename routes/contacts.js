var express = require('express');
var router = express.Router();
var db = require("../database");

var ensureLoggedIn = function(req, res, next) {
    if (req.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

/* GET contacts listing. */
router.get('/', ensureLoggedIn, function(req, res) {
    db.displayContacts({}, function(err, results) {
        if (err) {
            console.error(err);
            return;
        }
        res.render("contacts", { list: results });
    });
});

router.get('/edit/:id', ensureLoggedIn, function(req, res) {

    console.log("get param" + req.params.id);
    db.displayContactsById(req.params.id, function(err, results) {
        if (err) {
            console.error(err);
            return;
        }
        res.render("edit", { contacts: results[0] });
    });
});

router.post('/edit/:id', ensureLoggedIn, function(req, res) {

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

    //store the "id" parameter from the url
    contactId = req.params.id;

    //store the contact information of an object
    var contactArray = [];

    //push the contact information to the local array
    contactArray.push(contactId, honorifics, firstName, lastName, street, city, state, zip, phoneValue, emailValue, phone, mail, email);


    //update the contact corresponding to its id
    db.updateContact(contactArray, function(err, results) {
        if (err) {
            console.error(err);
            return;
        }
        res.redirect('/contacts');
    });
})


router.get('/delete/:id', ensureLoggedIn, function(req, res) {

    db.displayContactsById(req.params.id, function(err, results) {
        if (err) {
            console.error(err);
            return;
        }
        res.render("delete", { contacts: results[0] });
    });
});

router.post('/delete/:id', ensureLoggedIn, function(req, res) {

    db.deleteContact(req.params.id, function(err, results) {
        if (err) {
            console.error(err);
            return;
        }
        res.redirect("/contacts");
    });
});


router.post('/search', ensureLoggedIn, function(req, res) {

    var query = {};
    var first = req.body.searchbyfirst,
        last = req.body.searchbylast;

    //contruct a query based on regular expression
    //where the words need to match from the beginning
    //make it case insensitive
    if (first) {
        query = {
            "firstName": {
                "$regex": "^" + first,
                "$options": "i"
            }
        }
    } else if (last) {
        query = {
            "lastName": {
                "$regex": "^" + last,
                "$options": "i"
            }
        }
    }

    //check if either search fields for firstName and LastName is empty
    if (first || last) {
        db.searchContact(query, function(err, results) {
            if (err) {
                console.error(err);
                return;
            }

            res.render("results", { list: results });
        })
    }
    //user had both search fields blank
    else {
        res.redirect("/contacts");
    }
});

router.get('/logout', function(req, res) {
    res.redirect('/logout');
});

module.exports = router;