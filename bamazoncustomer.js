function BamazonCustomer() {
    var mysql = require("mysql");
    var inquirer = require("inquirer")


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


    var currentProduct = {};
    var snapshot;
    //found it online 

    function getList() {
        connection.query('SELECT * FROM products', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                data = data;
                userChoice(data);

            }
        });
    }

    getList();

    function userChoice(data) {
        inquirer
            .prompt(
                [{
                        name: "product",
                        type: "list",
                        message: "Please choose a product :",
                        choices: function () {
                            return data.map(item => item.item_id + ' | ' + item.product_name + ' | Price: $' + item.price + ' | Quantity Available: ' + item.stock_quantity)
                        }
                    },
                    {
                        name: "quantity",
                        type: "input",
                        message: function (answers) {
                            // let customQuantity = answers.products.split(' | ')[1];
                            let customQuantity = answers.quantity;


                            return "Enter the quantity for" + " " + answers.product.split('|')[1] + ":";
                        },
                        validate: function validateOrder(customQuantity) {
                            let reg = /^([1-9]|10)$/;


                            return reg.test(customQuantity) || "Please enter a valid ItemId";

                        }
                    },
                ]
            ).then(answers => {
                // console.log(JSON.stringify(answers, null, '  '));
                currentProduct.item_id = parseInt(answers.product.split('|')[0])
                currentProduct.product_name = answers.product.split('|')[1]
                currentProduct.price = parseFloat(answers.product.split('|')[2].split('$')[1])
                currentProduct.stock_quantity = parseInt(answers.product.split('|')[3].split(':')[1])
                currentProduct.order_quantity = parseInt(answers.quantity)




                checkavailaiblity();

            })

    };

    function checkavailaiblity() {

        if (currentProduct.stock_quantity >= currentProduct.order_quantity) {
            console.log("You have successfuly placed your order")
            updateDB();
            anotherOrder();

        } else {
            console.log("we only have" + " " + currentProduct.stock_quantity + "" + currentProduct.product_name + "" + "at the moment. Please choose again");
            getList();
        }
    }

    function updateDB() {
        let updatedQuantity = (currentProduct.stock_quantity - currentProduct.order_quantity)
        connection.query(
            "UPDATE products SET ? WHERE ?", [{
                    stock_quantity: updatedQuantity
                },
                {
                    item_id: currentProduct.item_id
                }
            ],
            function (error) {
                if (error) throw err;
            }
        );
    }

    function anotherOrder() {
        inquirer
            .prompt({
                name: "anotherOrder",
                type: "list",
                message: "Would you like to order another product? :",
                choices: ["YES", "NO"]

            }).then(answers => {

                switch (answers.anotherOrder){
                    case 'NO':
                    connection.end();
                    break;

                    case 'YES':
                    getList();
                    break;
                }
            })
    }
}

module.exports = BamazonCustomer;