var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/mydb3';
var database;

var async = require('async');

// google geocoder
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'INSERT GOOGLE MAPS API KEY HERE',
    formatter: null
};

var geocoder = NodeGeocoder(options);

var latitudeValue = 0;
var longitudeValue = 0;

// start Mongo server
exports.build = function() {
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Connected correctly to server.");

        database = db.db("mydb3");

        //the collection that we want to use
        database.createCollection('contacts', function(err, res) {
            if (err) {
                console.error(err);
                return;
            };
            console.log("Contacts collection created!");
        });
    });
}

exports.addContact = function(newcontact, callback) {
    console.log("Added contact: ");
    console.log(newcontact);

    var task = [];

    var address = (newcontact[3] + ", " + newcontact[4] + ", " + newcontact[5] + " " + newcontact[6]);

    task.push(function(done) {

        geocoder.geocode({ "address": address }, function(err, res) {
            if (err) {
                console.error(err);
                return;
            }
            for (var i = 0; i < res.length; i++) {
                longitudeValue = res[i].longitude;
                latitudeValue = res[i].latitude;
            }
            done();
        })
    });

    task.push(function(done) {
        database.collection('contacts').createIndex({ firstName: "text", lastName: "text" }, function(err, result) {
            done();
        })
    });

    console.log("long " + longitudeValue);
    console.log("lat " + latitudeValue);

    async.parallel(task, function() {
        database.collection('contacts').insertOne({
            honorifics: newcontact[0],
            firstName: newcontact[1],
            lastName: newcontact[2],
            street: newcontact[3],
            city: newcontact[4],
            state: newcontact[5],
            zip: newcontact[6],
            phoneValue: newcontact[7],
            emailValue: newcontact[8],
            phone: newcontact[9],
            mail: newcontact[10],
            email: newcontact[11],
            longitude: longitudeValue,
            latitude: latitudeValue
        }, function(err, result) {
            callback(err, result);
        })
    });
}

// display all the contacts from the database
exports.displayContacts = function(query, callback) {
    database.collection('contacts').find().toArray(function(err, result) {
        if (err) {
            callback(null, err);
        } else if (result.length > 0) {

            var return_result = [];
            for (var i = 0; i < result.length; i++) {

                return_result[i] = {
                    id: result[i]._id,
                    honorifics: result[i].honorifics,
                    firstName: result[i].firstName,
                    lastName: result[i].lastName,
                    street: result[i].street,
                    city: result[i].city,
                    state: result[i].state,
                    zip: result[i].zip,
                    phoneValue: result[i].phoneValue,
                    emailValue: result[i].emailValue,
                    phone: result[i].phone,
                    mail: result[i].mail,
                    email: result[i].email,
                    longitude: result[i].longitude,
                    latitude: result[i].latitude
                }
            }
            callback(null, return_result);
        } else {
            callback(null, err);
            console.error("No documents found!");
        }
    });
}

exports.displayContactsById = function(query, callback) {
    database.collection('contacts').find({ "_id": ObjectId(query) }).toArray(function(err, result) {
        if (err) {
            callback(null, err);
        } else if (result.length > 0) {

            var return_result = [];
            for (var i = 0; i < result.length; i++) {

                return_result[i] = {
                    id: result[i]._id,
                    honorifics: result[i].honorifics,
                    firstName: result[i].firstName,
                    lastName: result[i].lastName,
                    street: result[i].street,
                    city: result[i].city,
                    state: result[i].state,
                    zip: result[i].zip,
                    phoneValue: result[i].phoneValue,
                    emailValue: result[i].emailValue,
                    phone: result[i].phone,
                    mail: result[i].mail,
                    email: result[i].email,
                    longitude: result[i].longitude,
                    latitude: result[i].latitude
                }
            }
            callback(null, return_result);
        } else {
            callback(null, err);
            console.error("No documents found!");
        }
    });
}

// update contact based on a specific contact id
exports.updateContact = function(updated, callback) {
    database.collection('contacts').updateOne({ "_id": ObjectId(updated[0]) }, {
            $set: {
                honorifics: updated[1],
                firstName: updated[2],
                lastName: updated[3],
                street: updated[4],
                city: updated[5],
                state: updated[6],
                zip: updated[7],
                phoneValue: updated[8],
                emailValue: updated[9],
                phone: updated[10],
                mail: updated[11],
                email: updated[12]
            }
        },
        function(err, result) {
            callback(err, result);
        });
};

// delete contact based on a specific contact id
exports.deleteContact = function(deleted, callback) {
    database.collection('contacts').deleteOne({ "_id": ObjectId(deleted) },
        function(err, result) {
            callback(err, result);
        }
    )
};

exports.searchContact = function(query, callback) {
    database.collection('contacts').find(query).toArray(function(err, result) {
        if (err) {
            callback(null, err);
        } else if (result.length > 0) {

            var return_result = [];
            for (var i = 0; i < result.length; i++) {

                return_result[i] = {
                    id: result[i]._id,
                    honorifics: result[i].honorifics,
                    firstName: result[i].firstName,
                    lastName: result[i].lastName,
                    street: result[i].street,
                    city: result[i].city,
                    state: result[i].state,
                    zip: result[i].zip,
                    phoneValue: result[i].phoneValue,
                    emailValue: result[i].emailValue,
                    phone: result[i].phone,
                    mail: result[i].mail,
                    email: result[i].email,
                    longitude: result[i].longitude,
                    latitude: result[i].latitude
                }
            }
            callback(null, return_result);
        } else {
            callback(null, err);
            console.error("No documents found!");
        }
    });
}