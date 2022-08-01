import React, { useState } from 'react';
import SellForm from './SellForm';
import BuyForm from './BuyForm';

const Main = props => {
    const [currentMode, setCurrentMode] = useState("");

    return (
        <div id="content" className="mt-3">
            <div className="d-flex justify-content-between mb-3">
                <button
                    className="btn btn-light"
                    onClick={(event) => {
                        setCurrentMode('buy');
                    }}
                >
                    Buy
                </button>
                <button
                    className="btn btn-light"
                    onClick={(event) => {
                        setCurrentMode('sell');
                    }}
                >
                    Sell
                </button>
            </div>

        <div className="card mb-4" >
          <div className="card-body">
            {currentMode !== "" ? (currentMode === "buy" ? (
                <BuyForm 
                    ethBalance={props.ethBalance} 
                    tokenBalance={props.tokenBalance} 
                    buyTokensMethod={props.buyTokensMethod} 
                    isMining={props.isMining}
                />
            ) : (
                <SellForm 
                    ethBalance={props.ethBalance} 
                    tokenBalance={props.tokenBalance} 
                    sellTokensMethod={props.sellTokensMethod} 
                    isMining={props.isMining}
                />
            )) :
            (<p>Please click on the buttons above</p>)}
          </div>
        </div>
      </div>
    )
}

export default Main; 