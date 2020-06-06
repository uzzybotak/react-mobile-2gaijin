import React, { Component } from 'react';
import "./ProductCard.scss";
import { Link } from 'framework7-react';
import { geolocated } from 'react-geolocated';
import { ReactComponent as SoldOutIcon } from "../../icons/SoldOutIcon.svg";

class ProductCard extends Component {
    
    constructor(props) {
        super(props);
        this.state = { cardWidth: (window.innerWidth/2) - 25, cardHeight: (window.innerHeight/2) - 25, currLat: 0.0, currLng: 0.0 };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.findCoordinates = this.findCoordinates.bind(this);
    }

    findCoordinates = () => {
        navigator.geolocation.getCurrentPosition(position => {
            const location = JSON.stringify(position);
            this.setState({ currLat: position.coords.latitude, currLng: position.coords.longitude });
        });
    }
    
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.findCoordinates();
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    
    updateWindowDimensions() {
        this.setState({ cardWidth: (window.innerWidth/2) - 25 });
        this.setState({ cardHeight: (window.innerHeight/2) - 25 });
    }

    calcDistance(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2-lat1) * (Math.PI/180);
        var dLon = (lng2-lng1) * (Math.PI/180); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;

        var text = d.toFixed(1) + " km away";

        if (lat1 === 0.0 || lat2 === 0.0) {
            text = "";
        }

        return text;
    }

    redirectToProductDetail(productID) {
        this.$f7.view.main.router.navigate("/product/" + productID);
    }

    render() {
        if(typeof(this.props.item) !== 'undefined') {
            const item = this.props.item;
            var locText = this.calcDistance(parseFloat(item.location.latitude), 
            parseFloat(item.location.longitude), 
            parseFloat(this.state.currLat),  
            parseFloat(this.state.currLng));

            let locColumn;
            if(locText != "") {
                locColumn = <p className="location"><i className="fa fa-map-marker"></i>{locText}</p>
            }

            let soldOut;
            if(item.availability != "available") {
                soldOut = <div className="love-button card-sold">
                    <SoldOutIcon height="28px" />
                </div>;
            }

            return(
                <Link href={`/product/${item["_id"]}`} className="product-card" style={{ height: `${this.state.height}px`, width: `${this.state.cardWidth}px`}} >
                    <div className="content content-shadow-product">
                        {soldOut}
                        <div className="image-container" style={{backgroundImage: `url(${item["img_url"]})`, width: `${this.state.cardWidth}px`}}></div>
                        <div className="text">
                            <p className="title-product">{item.name}</p>
                            <p className="location">by {item.seller_name}</p>
                            <p className="price">¥{item.price}</p>
                            {locColumn}
                        </div>
                    </div>
                </Link>
            );
        } else {
            return '';
        }
    }
}
    
export default geolocated({
    positionOptions: {
        enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  })(ProductCard);