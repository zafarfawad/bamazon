function bamazonManager(){
var mysql = require("mysql");
var inquirer = require("inquirer")
const cTable = require('console.table');


var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
});

managerOptions();

function managerOptions() {
    {
        inquirer
            .prompt({
                name: "product",
                type: "list",
                message: "Select an action to perform :",
                choices: ["View Products for Sale", "View Low Inventory", "Add stock for Inventory", "Add New Product"]
            }).then(answers => {
                switch (answers.product) {
                    case 'View Products for Sale':
                        getList();
                        break;

                    case 'View Low Inventory':
                        lowInventory();
                        break;

                    case 'Add stock for Inventory':
                        getInventoryList();
                        break;

                    case 'Add New Product':
                        addProduct();
                        break;
                }
            })
    }



    var currentProduct = {};
    var data;
    //found it online 

    function getList() {
        connection.query('SELECT * FROM products', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                data = data;
                console.table(data);
                connection.end();
            }
        });
    }

    // getList();

    function lowInventory() {
        connection.query('SELECT * FROM products where stock_quantity < 5', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                data = data;
                console.table(data);
                connection.end();
            }
        });
    }

    function getInventoryList() {
        connection.query('SELECT * FROM products', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                data = data;
                getListToAddInventory(data);
            }
        });
    }

    function getListToAddInventory(data) {
        inquirer
            .prompt({
                name: "product",
                type: "list",
                message: "Please choose an item to add inventory",
                choices: function () {
                    return data.map(item => item.item_id + ' | ' + item.product_name + ' | Price: $' + item.price + ' | Quantity Available: ' + item.stock_quantity)
                }

            }).then(answers => {
                // console.log(JSON.stringify(answers, null, '  '));
                currentProduct.item_id = parseInt(answers.product.split('|')[0])
                currentProduct.product_name = answers.product.split('|')[1]
                currentProduct.price = parseFloat(answers.product.split('|')[2].split('$')[1])
                currentProduct.stock_quantity = parseInt(answers.product.split('|')[3].split(':')[1])

                askquantity();

            })
    }

    function addInventory() {
        // askquantity();

        let updatedQuantity = (currentProduct.stock_quantity + currentProduct.add_quantity)
        connection.query(
            "UPDATE products SET ? WHERE ?", [{
                stock_quantity: updatedQuantity
            },
            {
                item_id: currentProduct.item_id
            }
            ],


            function (error) {
                if (error) throw error;
            }
            
        );
        console.log(currentProduct.product_name + "has been updated")
        connection.end();
    }

    function askquantity() {
        inquirer
            .prompt({
                name: "add_quantity",
                type: "input",
                // message: "Enter the quantity you want to add to the product:"
                message: function (answers) {
                    let customQuantity = answers.quantity;
                    return "Enter the quantity:";
                },
                validate: function validateOrder(customQuantity) {
                    let reg = /^([1-9]|10)$/;
                    return reg.test(customQuantity) || "Please enter a valid ItemId";

                }

            }).then(answers => {
                // console.log(JSON.stringify(answers, null, '  '));
                // currentProduct.item_id = answers.name

                currentProduct.add_quantity = parseInt(answers.add_quantity)

                addInventory();
                
            })
    }

    function addProduct() {
        inquirer
            .prompt(
                [{
                        name: "name",
                        type: "input",
                        message: "Enter the name of the product:"
                    },

                    {
                        name: "department",
                        type: "input",
                        message: "Enter the department of the product:"
                    },

                    {
                        name: "price",
                        type: "input",
                        message: function (answers) {
                            let price = answers.price;
                            return "Enter the Price:";
                        },
                        validate: function validateOrder(customQuantity) {
                            let reg = /^([1-9]|10)$/;
                            return reg.test(customQuantity) || "Please enter a valid ItemId";

                        }
                    },
                    {
                        name: "stock_quantity",
                        type: "input",
                        message: function (answers) {
                            let customQuantity = answers.stock_quantity;
                            return "Enter the quantity:";
                        },
                        validate: function validateOrder(customQuantity) {
                            let reg = /^([1-9]|10)$/;
                            return reg.test(customQuantity) || "Please enter a valid ItemId";

                        }
                    },

                ]
            ).then(answers => {
                // console.log(JSON.stringify(answers, null, '  '));
                // currentProduct.item_id = answers.name
                currentProduct.product_name = answers.name
                currentProduct.department_name = answers.department
                currentProduct.price = parseFloat(answers.price)
                currentProduct.stock_quantity = parseInt(answers.stock_quantity)

                addProductDB();

            })
    }

    //INSERT INTO products(item_id, product_name, department_name, price, stock_quantity) VALUES("vanilla", 2.50, 100);

    function addProductDB() {
        // var insertQuery = 'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)';
        var values = [
            currentProduct.product_name,
            currentProduct.department_name,
            currentProduct.price,
            currentProduct.stock_quantity

        ]

        connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?,?,?,?);', values, function (err, result) {
            if (err) throw err;
            console.log("The following data has been inserted into the table");
            console.table(currentProduct);
            connection.end();
        });

    }
}
}

module.exports = bamazonManager;