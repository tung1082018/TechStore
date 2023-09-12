import React from "react";
import Products from "../components/ProductsPage/Products";
import Hero from "../components/Hero";
import productBcg from '../images/productsBcg.jpeg';

const ProductsPage = () => {
    return (
        <React.Fragment>
            <Hero img={productBcg}/>
            <Products/>
        </React.Fragment>
    );
}

export default ProductsPage;