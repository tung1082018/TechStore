import React from "react";
import Hero from "../components/Hero";
import cartBcg from '../images/storeBcg.jpeg';
import CartSection from '../components/CartPage';

const CartPage = () => {
    return (
        <React.Fragment>
            <Hero img={cartBcg} title=""/>
            <CartSection/>
        </React.Fragment>
    );
}

export default CartPage;