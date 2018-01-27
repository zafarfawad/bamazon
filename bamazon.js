
var BamazonCustomer= require("./bamazoncustomer");
var BamazonManager = require("./bamazonmanager");


var userInput = process.argv[2]


switch (userInput){
    case 'customer':
    BamazonCustomer();
    break;

    case 'manager':
    BamazonManager();
    break;

}

