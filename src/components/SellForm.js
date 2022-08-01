import React, { useState } from 'react';
import ethLogo from '../eth-logo.png';
import j4keLogo from '../j4ke-logo.png';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SellForm = props => {

    const validationSchema = Yup.object({
        tokensToSell: Yup.string().required('Required'),
      });

    return (
        <Formik
            initialValues={{ tokensToSell: '', output: '' }}
            validationSchema={validationSchema}
            onSubmit={async (data, { setSubmitting }) => {
                setSubmitting(true);
                console.log("sell data: ", data);
                let tokenAmount = window.web3.utils.toWei(data.tokensToSell, 'Ether');
                console.log("Token amount to sell: ", tokenAmount);
                await props.sellTokensMethod(tokenAmount);
                setSubmitting(false);
            }}
        >
        {({ values, errors, handleSubmit, handleChange, isSubmitting, setFieldValue }) => (

            <form noValidate className="mb-3" onSubmit={handleSubmit}>
                <div>
                    <label className="float-left"><b>Input</b></label>
                    <span className="float-right text-muted">
                        Balance: {window.web3.utils.fromWei(`${props.tokenBalance}`, 'Ether')}
                    </span>
                </div>

                <div className="input-group mb-4">
                    <Field
                        name="tokensToSell"
                        className="form-control form-control-lg"
                        onChange={e => {
                            handleChange(e);

                            setFieldValue('output', `${e.target.value / 100}`)
                        }}
                        placeholder="0" 
                        />
                        <ErrorMessage
                            component="div"
                            name="tokensToSell"
                            className="input-feedback"
                            style={{ color: 'red' }}
                        />
                    <div className="input-group-append">
                        <div className="input-group-text">
                        <img src={j4keLogo} height='32' alt=""/>
                        &nbsp; J4KE
                        </div>
                    </div>
                </div>
                <div>
                    <label className="float-left"><b>Output</b></label>
                    <span className="float-right text-muted">
                        Balance: {window.web3.utils.fromWei(`${props.ethBalance}`, 'Ether')}
                    </span>
                </div>
                <div className="input-group mb-2">
                    <Field
                        name="output"
                        className="form-control form-control-lg"
                        placeholder="0"
                        disabled
                    />
                    <div className="input-group-append">
                        <div className="input-group-text">
                            <img src={ethLogo} height='32' alt=""/>
                            &nbsp;&nbsp;&nbsp; ETH
                        </div>
                    </div>
                </div>
                <div className="mb-5">
                    <span className="float-left text-muted">Exchange Rate</span>
                    <span className="float-right text-muted">100 J4KE = 1 ETH</span>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>{props.isMining ? 'Mining...': 'SWAP!'}</button>
            </form>
        )}
    	</Formik>
    )
}

export default SellForm;