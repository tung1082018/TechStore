import React, {Component} from "react";
import {linkData} from "./linkData";
import {socialData} from "./socialData";
import {items} from "./productData";

const ProductContext = React.createContext();

// Provider
class ProductProvider extends Component {
    state = {
        sidebarOpen: false,
        cartOpen: false,
        links: linkData,
        socialIcons: socialData,
        cart: [],
        cartItems: 0,
        cartSubTotal: 0,
        cartTax: 0,
        cartTotal: 0,
        storeProducts: [],
        filteredProducts: [],
        featuredProducts: [],
        singleProduct: {},
        loading: true,
        // search products
        search: '',
        price: 0,
        min: 0,
        max: 0,
        company: 'all',
        shipping: false
    }

    componentDidMount() {
        // from contentful items
        this.setProducts(items);
    }

    // set products
    setProducts = (products) => {
        let storeProducts = products.map(item => {
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {id, ...item.fields, image}; // product
        });
        console.log('storeProducts', storeProducts);

        // featured products
        let featuredProducts = storeProducts.filter(item => item.featured === true);

        // get max price
        let maxPrice = Math.max(...storeProducts.map(item => item.price));
        console.log('maxPrice', maxPrice);

        this.setState({
            storeProducts,
            filteredProducts: storeProducts,
            featuredProducts,
            cart: this.getStorageCart(),
            singleProduct: this.getStorageProduct(),
            loading: false,
            price: maxPrice,
            max: maxPrice
        }, () => {
            this.addTotals();
        });
    }

    // get cart from local storage
    getStorageCart = () => {
        let cart;
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'));
        } else {
            cart = [];
        }
        return cart;
    }

    // get product from local storage
    getStorageProduct = () => {
        return localStorage.getItem('singleProduct') ? JSON.parse(localStorage.getItem('singleProduct')) : {};
    }

    // get totals
    getTotals = () => {
        let subTotal = 0;
        let cartItems = 0;
        this.state.cart.forEach(item => {
            subTotal += item.total;
            cartItems += item.count;
        });
        subTotal = parseFloat(subTotal.toFixed(2));
        let tax = subTotal * 0.2;
        tax = parseFloat(tax.toFixed(2));
        let total = subTotal + tax;
        total = parseFloat(total.toFixed(2));

        return {
            cartItems,
            subTotal,
            tax,
            total
        };
    }

    // add totals
    addTotals = () => {
        const totals = this.getTotals();
        this.setState({
            cartItems: totals.cartItems,
            cartSubTotal: totals.subTotal,
            cartTax: totals.tax,
            cartTotal: totals.total
        });
    }

    // sync storage
    syncStorage = () => {
        localStorage.setItem('cart', JSON.stringify(this.state.cart));
    }

    // add to cart
    addToCart = (id) => {
        // console.log(`add to cart ${id}`);
        let tempCart = [...this.state.cart];
        let tempProducts = [...this.state.storeProducts];
        let tempItem = tempCart.find(item => item.id === id);
        // if the item does not exist in the cart
        if (!tempItem) {
            tempItem = tempProducts.find(item => item.id === id);
            let total = tempItem.price;
            let cartItem = {...tempItem, count: 1, total};
            tempCart = [...tempCart, cartItem];
        } else {
            tempItem.count++;
            tempItem.total = tempItem.price * tempItem.count;
            tempItem.total = parseFloat(tempItem.total.toFixed(2));
        }
        this.setState(() => {
            return {cart: tempCart}
        }, () => {
            this.addTotals();
            this.syncStorage();
            this.openCart();
        });
    }

    // set single product
    setSingleProduct = (id) => {
        // console.log(`set single product ${id}`);
        let product = this.state.storeProducts.find(item => item.id === id);
        localStorage.setItem('singleProduct', JSON.stringify(product));
        this.setState({
            singleProduct: {...product},
            loading: false
        });
    }

    // handle sidebar
    handleSidebar = () => {
        this.setState({sidebarOpen: !this.state.sidebarOpen});
    }

    // handle cart
    handleCart = () => {
        this.setState({cartOpen: !this.state.cartOpen});
    }

    // close cart
    closeCart = () => {
        this.setState({cartOpen: false});
    }

    // open cart
    openCart = () => {
        this.setState({cartOpen: true});
    }

    // cart functionality
    // increment
    increment = (id) => {
        // console.log('increment', id);
        let tempCart = [...this.state.cart];
        const cartItem = tempCart.find(item => item.id === id);
        // console.log('cartItem', cartItem);
        cartItem.count++;
        cartItem.total = cartItem.count * cartItem.price;
        cartItem.total = parseFloat(cartItem.total.toFixed(2));
        this.setState(() => {
            return {
                cart: [...tempCart]
            }
        }, () => {
            this.addTotals();
            this.syncStorage();
        });
    }

    // decrement
    decrement = (id) => {
        // console.log('decrement', id);
        let tempCart = [...this.state.cart];
        const cartItem = tempCart.find(item => item.id === id);

        cartItem.count--;
        if (cartItem.count === 0) {
            this.removeItem(id);
        } else {
            cartItem.total = cartItem.count * cartItem.price;
            cartItem.total = parseFloat(cartItem.total.toFixed(2));
            this.setState(() => {
                return {
                    cart: [...tempCart]
                }
            }, () => {
                this.addTotals();
                this.syncStorage();
            });
        }
    }

    // remove item
    removeItem = (id) => {
        // console.log('removeItem', id);
        let tempCart = [...this.state.cart];
        tempCart = tempCart.filter(item => item.id !== id);
        this.setState({
            cart: [...tempCart]
        }, () => {
            this.addTotals();
            this.syncStorage();
        });
    }

    // clear cart
    clearCart = () => {
        // console.log('awesome you just cleared the cart');
        this.setState({
            cart: []
        }, () => {
            this.addTotals();
            this.syncStorage();
        });
    }

    // handle filtering
    handleChange = (event) => {
        // console.log('event', event);
        const name = event.target.name;
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        // console.log(`Name : ${name}, Value: ${value}`);
        this.setState({
            [name]: value
        }, this.sortData);
    }

    sortData = () => {
        // console.log('sorting data...');
        const {storeProducts, price, company, shipping, search} = this.state;
        let tempProducts = [...storeProducts];

        // console.log('price', typeof price, price)
        let tempPrice = parseInt(price);
        // console.log('tempPrice', typeof tempPrice, tempPrice);

        // filtering based on price
        tempProducts = tempProducts.filter(item => item.price <= tempPrice);

        // filtering based on company
        if (company !== "all") {
            tempProducts = tempProducts.filter(item => item.company === company);
        }

        // filtering based on shipping
        if (shipping) {
            tempProducts = tempProducts.filter(item => item.freeShipping === true);
        }

        // filtering based on search
        if (search.length > 0) {
            tempProducts = tempProducts.filter(item => {
                let tempSearch = search.toLowerCase();
                let tempTitle = item.title.toLowerCase().slice(0, search.length);
                if (tempSearch === tempTitle) {
                    return item;
                }
            });
        }

        this.setState({
            filteredProducts: tempProducts
        });
    }

    render() {
        const valueObj = {
            ...this.state,
            handleSidebar: this.handleSidebar,
            handleCart: this.handleCart,
            closeCart: this.closeCart,
            openCart: this.openCart,
            addToCart: this.addToCart,
            setSingleProduct: this.setSingleProduct,
            increment: this.increment,
            decrement: this.decrement,
            removeItem: this.removeItem,
            clearCart: this.clearCart,
            handleChange: this.handleChange
        }
        return (
            <ProductContext.Provider value={valueObj}>
                {this.props.children}
            </ProductContext.Provider>
        )
    }
}

// Consumer
const ProductConsumer = ProductContext.Consumer;

export {ProductProvider, ProductConsumer};