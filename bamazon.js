
var BamazonCustomer= require("./bamazoncustomer");

var userInput = process.argv[2]


switch (userInput){
    case 'customer':
    BamazonCustomer();
    break;

    case 'manager':
    console.log("work in progress");
    break;

}

