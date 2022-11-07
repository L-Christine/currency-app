import React, { useEffect, useState } from 'react'
import './App.css';
import CurrencyRow from './CurrencyRow';

const BASE_URL = `https://api.apilayer.com/exchangerates_data/latest`
 
let myHeaders = new Headers();
myHeaders.append("apikey", "X6ZpO0m5OSMcvLGXTLGSZHankJciHUZY");

let requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: myHeaders
};

function App() {
  const [currencyOptions, setCurrencyOptions] = useState([])
  const [fromCurrency, setFromCurrency] = useState()
  const [toCurrency, setToCurrency] = useState()
  const [exchangeRate, setExchangeRate] = useState()
  const [amount, setAmount] = useState(1) //default 1
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true) //which box did you changed the amount? From or To box?

  let toAmount, fromAmount
  if (amountInFromCurrency){ 
    //if true(already default), amount in state is fromAmount(=1)
    fromAmount = amount
    toAmount = amount * exchangeRate
  } else {
    //when amountInToCurrency, amount in state is toAmount
    toAmount = amount
    fromAmount = amount / exchangeRate //reverse amount * exchangeRate by dividing
  }

  useEffect(() => {
    fetch(BASE_URL, requestOptions) //requestOptions required for the apikey
      .then(res => res.json()) //convert res to json
      .then(data => {
        const firstCurrency = Object.keys(data.rates)[0]
        setCurrencyOptions([data.base, ...Object.keys(data.rates)])
        setFromCurrency(data.base)
        setToCurrency(firstCurrency)
        setExchangeRate(data.rates[firstCurrency]) //actual rate for currency
      })
  }, []) //empty array = call useEffect once
  
  //Update conversion when the currency changes 
  useEffect(() => {
    if (fromCurrency === toCurrency && fromCurrency != null){
      setExchangeRate(1)
    } else if (fromCurrency != null && toCurrency != null) {
      fetch(`${BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`, requestOptions)
        .then(res => res.json()) //get back response, convert to json
        .then(data => setExchangeRate(data.rates[toCurrency])) //go to API and get new exchange rate when enter
    }
  }, [fromCurrency, toCurrency]) //anytime when fromCurrency or toCurrency changes

  //==function: enter new amount in the box, auto-update the other box
  function handleFromAmountChange(e) {
    setAmount(e.target.value)
    setAmountInFromCurrency(true)  
  }

  function handleToAmountChange(e) {
    setAmount(e.target.value)
    setAmountInFromCurrency(false) //change setAmountInFromCurrency to false
  }

  return (
    <>
    <h1>Currency Conversion</h1>
    {/* pass in currencyOptions as a props */}
    <CurrencyRow 
      currencyOptions={currencyOptions} 
      selectedCurrency={fromCurrency}
      onChangeCurrency={e => setFromCurrency(e.target.value)} //change and update currency to whatever the value of <select> in CurrencyRow.js
      onChangeAmount={handleFromAmountChange} //updating this 'from' box will auto-update 'to' box based on the rate
      amount={fromAmount}
    />
    <div className='equals'>=</div>
    <CurrencyRow 
      currencyOptions={currencyOptions}
      selectedCurrency={toCurrency}
      onChangeCurrency={e => setToCurrency(e.target.value)}
      onChangeAmount={handleToAmountChange} //updating this 'to' box will auto-update 'from' box based on the rate
      amount={toAmount}
    />
    </>
  );
}

export default App;
