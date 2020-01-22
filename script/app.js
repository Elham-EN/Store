//can use to get some content from Contentful with this SDK
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "3y3z3ns4ew0w",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "ZokbmikYqWJd1gzPJrLFPpnyy3v3ZumNK-3yg4VJf2Q"
  });

//DOM Variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');  
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');

/*main cart item -placing information and getting information 
from the local storage  */ 
let cart = []; //empty array

//buttons - empty array. later on when removing the item from the car
//would want to select again the same button
let buttonsDOM = [];

//getting the product locally first from JSON
class Products {
    async getProducts() { //it returns a promise
        try {
          //Gets a collection of Entries
          let contentful = await client.getEntries({ //wait for promise 
            content_type: 'comfyHouseProducts'
          });
            
            
            /*waits for a promise to resolve or reject.*/
            let result = await fetch('products.json') //getting data from JSON

/*Instead of simple result, return me data using JSON method we have on the fetch*/
            let data = await result.json(); //wait when finished with result

            //holding items array
            let products = contentful.items //object.property

/*map() create an array from calling a specific function on each item in the 
parent array.Parameter of that function is the current value of the item.
With this parameter, we can modify each individual item in an array and 
create a new function off it.*/
            products = products.map(item => { 
            //Destructuring means taking out individual items from an object or
            // an array and assigning them to a variable.
                const {title, price} = item.fields;//extract title & price from fields
                const {id} = item.sys; //extracting id from sys
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}; //return clean object
            });
            return products; //not the data

        } catch (error) {
            console.log(error);
        }
    }
} //end of class Products

//display product - getting the item retrun from the products
class UI {
    displayProducts(products) { //call this method once get the products
        let result = '';
//execute a function on each element in an array.
        products.forEach(product => { //to get the property from the object
            //adding the result
            result += `
            <!--single product-->
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!--end of product-->
            `;
        });
        //after foreach put it in the product DOM 
        productDOM.innerHTML = result;
    }
    getBagButton() {
        //spread operator - expands an array into a list
        //turn this into an array
        const buttons = [...document.querySelectorAll('.bag-btn')];
    
        buttonsDOM = buttons; //assgin buttons to the array

        buttons.forEach(button => { //loop through each button
            let id = button.dataset.id;//get id value

            /*find item if it is in the cart. inside the callback function
            pass item argument to item and if the item.id matches the id 
            in the buttons*/ //at moment the cart is empty array.
            let inCart = cart.find(item => item.id == id);
            
            //check if the item is already in the cart
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            } 

                button.addEventListener('click', (event) => { //event object
                     event.target.innerText = "In Cart"; //target the bag button
                     event.target.disabled = true;

                     //get product from products based on the button id
                     /*cartItem is the object and with spread opeator - get all
                     the properties and values. amount property added to the new obj*/
                     let cartItem = {...Storage.getProduct(id), amount: 1};
                      
                     //add product to the cart array.
                     cart = [...cart, cartItem]; //spread cart into list
                     
                     //save cart in local storage
                     Storage.saveCart(cart)

                     //set cart value
                     this.setCartValues(cart);

                     //display cart item
                     this.addCartItem(cartItem) //passing cartItem obj as argument
                     
                     //show the cart
                     this.showCart();

                }); ///end of button.addEventListner
        }); //end buttons.forEach()
    } //end of getBagButton()
    setCartValues(cart) {
         let temTotal = 0;
         let itemsTotal = 0;
         cart.map(item => { //going through each every item
            temTotal += item.price * item.amount; //each iteration 
            itemsTotal += item.amount;
         });
         cartTotal.innerText = parseFloat(temTotal.toFixed(2));
         cartItems.innerText = itemsTotal;     
    } 
    addCartItem(item) { //parameter - cart item object
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src="${item.image}" alt="product">
                <div>
                    <h4>${item.title}</h4>
                    <h5>${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>remove</span>
                </div>
                <div> 
                    <i class="fas fa-chevron-up" data-id=${item.id}></i>
                    <p class="item-amount" data-id=${item.amount}>1</p>
                    <i class="fas fa-chevron-down" data-id=${item.id}></i>
                </div> 
         `; 
         cartContent.appendChild(div); // add to the cart content 
    } //end addCartItem()

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupAPP() {
/*upon the loading of the app check what is the cart value if there is something in 
the cart, assign Storage data to the cart or not then cart will just be an empty array*/ 
        cart = Storage.getCart(); 
//if there is item in the cart. setCartValues() will change the item values
        this.setCartValues(cart); 
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart); 
    }

/*will look for cart array*/
    populateCart(cart) { //loop trhrough each item that will be in the cart
         cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic() {
         clearCartBtn.addEventListener('click', () => {
             this.clearCart();
         });

         //Cart functionailty - want to access wheather remove
         //wheather increase or decrease in Cart Content
         cartContent.addEventListener('click', event => {
             //if the target event has the class remove-item or not
             if (event.target.classList.contains('remove-item')) {
                 //only accessing remove element
                 let removeItem = event.target;
                 let id = removeItem.dataset.id// getting id from data-id
                 //remove from the DOM
                 cartContent.removeChild(removeItem.parentElement.parentElement);
                 this.removeItem(id);//this remove from the cart array
             }
             else if (event.target.classList.contains('fa-chevron-up')) {
                 let addAmount = event.target; //target cheveron-up
                 let id = addAmount.dataset.id; 
            /*get amo unt item from the cart and update the value once update then 
            push the new amount to a local storage */
            //Return specific item from cart whose id matches the id we just got when click on
                 let temItem = cart.find(item => item.id === id);            
                 temItem.amount = temItem.amount + 1; //update the value
                 //getting the new cart value and save it to the Storage
                 Storage.saveCart(cart); 
                 //Update Cart total 
                 this.setCartValues(cart);
                 //to update the amount in cart content by using chevron-up
                 addAmount.nextElementSibling.innerText = temItem.amount;
             }
             else if (event.target.classList.contains('fa-chevron-down')) {
                 let lowerAmount = event.target;
                 let id = lowerAmount.dataset.id;
                 let temItem = cart.find(item => item.id === id);
                 temItem.amount = temItem.amount - 1; 
                 if (temItem.amount > 0) { //if amount is bigger than zero
                     Storage.saveCart(cart); //save last value from the cart
                     this.setCartValues(cart)
                     lowerAmount.previousElementSibling.innerText = temItem.amount;
                 }
                 else {
                     //remove the item from the DOM
                     cartContent.removeChild(lowerAmount.parentElement.parentElement);
                     //remove the item from the cart array
                     this.removeItem(id);
                 }
             }
         });
    }

    clearCart() {  //creat new array - cartItems
        //get the id of each cart items
        let cartItems = cart.map(item => item.id); //loop over this array
        //removing all the items - loop through each item and remove
        cartItems.forEach(id => this.removeItem(id));
        
        //if the size of child node is greater then 0 in cart Content
        //then keep removing all the children
        while (cartContent.children.length>0) {
            cartContent.removeChild(cartContent.children[0])//removing the first childNode
        }

        this.hideCart();
    }
    //this cart have current cart values and like to filter and remove
    //or return all the item that dont have the id in the parameter.
    removeItem(id) {
        //this update the cart - every each in the item return only if the item
        //in the cart does not have this id
        cart = cart.filter(item => item.id !== id);
        console.log(cart);
    
        this.setCartValues(cart);

        //get the value of the cart basically
        Storage.saveCart(cart);

        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class=fas fa-shopping-cart"></i>add to cart`;
    }

     getSingleButton(id) {
         //button has the attribute of dataset id equal to id of buttom passing in
         //this will get specifc button that was used to add thay item to the cart
         return buttonsDOM.find(button => button.dataset.id  === id);
     }

} //end of Class UI 

//local storage 
class Storage { //parameter - products array
    static savedProducts(products) { //Saved as string
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) { //button id
        //retrieve product array from local storage
        let products = JSON.parse(localStorage.getItem('products')); 
        return products.find(product => product.id === id); //get specific product
    } 

    static saveCart(cart) { //store Cart data to local storage 
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() { //either that item exist or not 
        //ternary operator - if exist, return with localStorage converted to object
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart'))
        : []; //else return an empty array 
    }

}//End of Class Storage

//Listen and add event when DOM content loaded 
document.addEventListener("DOMContentLoaded", () => {
    //create Instance
    const ui = new UI();
    const products = new Products();

    //Setup Application
    ui.setupAPP(); //before retreving the product

    //get all products
    /*The then() method returns a Promise. It takes two arguments: callback 
    functions for the success and failure cases of the Promise. */
    products.getProducts().then(Productdata => {
        ui.displayProducts(Productdata); //Product arraay parameter
        Storage.savedProducts(Productdata);
    }).then( () => { //once products loaded 
        ui.getBagButton();
        ui.cartLogic();
    });
});