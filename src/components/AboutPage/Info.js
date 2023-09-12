import React from "react";
import Title from "../Title";
import aboutBcg from '../../images/aboutBcg.jpeg';

const Info = () => {
    return (
        <section className="py-5">
            <div className="container">
                <div className="row">
                    <div className="col-10 mx-auto col-md-6 my-3">
                        <img src={aboutBcg} className="img-fluid img-thumbnail"
                             alt="about company" style={{background: 'var(--darkGrey)'}}/>
                    </div>
                    <div className="col-10 mx-auto col-md-6 my-3">
                        <Title title="about us"/>
                        <p className="text-left text-muted my-3">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vel semper tellus, eu dignissim enim.
                            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec egestas elit est, ac vehicula ligula commodo ut.
                        </p>
                        <button type="button" className="main-link" style={{marginTop: "2rem"}}>more info</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Info;
