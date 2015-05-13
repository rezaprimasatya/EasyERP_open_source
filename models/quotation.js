/**
 * Created by Roman on 04.05.2015.
 */

module.exports = (function () {
    var mongoose = require('mongoose');
    var ObjectId = mongoose.Schema.Types.ObjectId;
    var Schema = mongoose.Schema;

    var payments = {
        _id: false,
        id: false,
        total: {type: Number, default: 0},
        unTaxed: {type: Number, default: 0}
    };

    var products = {
        _id: false,
        id: false,
        scheduledDate: {type: Date},
        quantity: {type: Number, default: 1},
        unitPrice: Number,
        product: {type: ObjectId, ref: 'Product', default: null},
        description: {type: String, default: ''}
    };


    var quotationSchema = new Schema({
        supplier: {type: ObjectId, ref: 'Customers', default: null},
        supplierReference: {type: String, default: ''},
        /*deliverTo: {type: ObjectId, default: true},*/
        orderDate: {type: Date, default: Date.now},
        expectedDate: Date,
        name: {type: String, default: 'PO', unique: true},
        destination: String,
        incoterm: String,
        invoiceControl: {
            type: String,
            enum: ['Based on Purchase Order lines', 'Based on generated draft invoice', 'Based on incoming shipments'],
            default: 'Based on generated draft invoice'
        },
        invoiceRecived: {type: Boolean, default: false},
        paymentTerm: {type: ObjectId, ref: 'PaymentTerms', default: null},
        paymentInfo: payments,
        fiscalPosition: {type: ObjectId, ref: 'FiscalPositions', default: null},
        products: [products],
        workflow: {type: ObjectId, ref: 'workflows', default: null},
        whoCanRW: {type: String, enum: ['owner', 'group', 'everyOne'], default: 'everyOne'},
        groups: {
            owner: {type: ObjectId, ref: 'Users', default: null},
            users: [{type: ObjectId, ref: 'Users', default: null}],
            group: [{type: ObjectId, ref: 'Department', default: null}]
        },
        creationDate: {type: Date, default: Date.now},
        createdBy: {
            user: {type: ObjectId, ref: 'Users', default: null},
            date: {type: Date, default: Date.now}
        },
        editedBy: {
            user: {type: ObjectId, ref: 'Users', default: null},
            date: {type: Date, default: Date.now}
        }
    }, {collection: 'Quotation'});

    mongoose.model('Quotation', quotationSchema);

    quotationSchema.pre('save', function (next) {
        var quotation = this;
        var db = quotation.db.db;

        db.collection('settings').findAndModify({
                _id: db.databaseName,
                name: 'quotation'
            },
            [['name', 1]],
            {
                $inc: {seq: 1}
            },
            {
                new: true
            },
            function (err, rate) {
                if (err) {
                    return next(err);
                }

                quotation.name = 'PO' + rate.seq;

                next()
            });
    });

    if (!mongoose.Schemas) {
        mongoose.Schemas = {};
    }

    mongoose.Schemas['Quotation'] = quotationSchema;
})();