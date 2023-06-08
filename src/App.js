import React, { Component } from 'react'
import { IMaskInput } from 'react-imask';
import { DatePicker, Button } from 'antd';


export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      main: 'box',
      grafic: 'none',
      summ: 0,
      precent: 0,
      months: 0,
      date: 0,
      sms: 0,
      pdp: 'none',
      pdpdate: '',
      inputs: [''],
      cdp: ['']
    }
  }

  handleInputChange(index, dateString) {
    const value = dateString;
    const inputs = [...this.state.inputs];
    inputs[index] = value;
    this.setState({ inputs });
  }
  handleCdpChange(index, event) {
    const { value } = event.target;
    const cdp = [...this.state.cdp];
    cdp[index] = value;
    this.setState({ cdp });
  }
  addInput() {
    this.setState(prevState => ({ inputs: [...prevState.inputs, ''] }));
    this.setState(prevState => ({ cdp: [...prevState.cdp, ''] }));
  }
  removeInput(index) {
    this.setState(prevState => {
      const inputs = [...prevState.inputs];
      const cdp = [...prevState.cdp];
      inputs.splice(index, 1);
      cdp.splice(index, 1);
      return { inputs, cdp };
    });
  }




  decimalAdjust(type, value, exp) {
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Если значение не является числом, либо степень не является целым числом...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }
  round10 = function(value, exp) {
    return this.decimalAdjust('round', value, exp);
  };
  overpayment() {
    const precent = Number(this.state.precent) * 0.010000
    const months = this.state.months
    const overpayment = (precent/12*((1+precent/12))**months)/(((1+precent/12)**months)-1)
    return  overpayment
  };
  overpay() {
    const summ = this.state.summ
    const months = this.state.months
    return  ((summ * this.overpayment()) * months) - summ
  }
  howMuchDays (year , month) {
    var date1 = new Date(year, month-1, 1);
    var date2 = new Date(year, month, 1);
    return Math.round((date2 - date1) / 1000 / 3600 / 24);
  }
  days_of_a_year(year) {  
    return this.isLeapYear(year) ? 366 : 365;
  }
  isLeapYear(year) {
       return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  }
  
  
  grafic() {
    const summ = this.state.summ;
    const sms = Number(this.state.sms);
    const precent = Number(this.state.precent) * 0.010000;
    const months = this.state.months;
    const pdpdate = new Date(this.state.pdpdate);
    let pdpmonth = 0
    let pdpyear = 0
    if (this.state.pdpdate) {
      pdpmonth = pdpdate.getMonth()
      pdpyear = pdpdate.getFullYear()
    }
    let cdpmonth = []
    let cdpyear = []
    let cdpsumm = []
    if (this.state.inputs && this.state.cdp) {
      for (let index = 0; index < this.state.inputs.length; index++) {
        const dates = new Date(this.state.inputs[index])
        cdpmonth.push(dates.getMonth())
        cdpyear.push(dates.getFullYear())
        cdpsumm.push(this.state.cdp[index])
      }
    }
    // const arras = [new Date("2023-06-17").getMonth() + 1, new Date("2023-06-17").getFullYear(), 90000]
    const overpayment = this.overpayment();
    const date =  new Date(this.state.date);
    let summ2 = summ
    let ej = overpayment * summ2
    let mes = date.getMonth()  + 1
    let year = date.getFullYear()
    let ret = [[date.toLocaleDateString(), 0, 0, 0, summ, 0]]

    let idl = 0




    for (let index = 0; index < months; index++) {
      let pr = summ2 * precent * this.howMuchDays(year, mes) / this.days_of_a_year(year)
      let sj = 0
      if (pdpmonth === mes && pdpyear === year) {
        sj = (summ2 - pr)
        index = months - 1
        summ2 -= sj
      } else if (cdpmonth[idl] === mes && cdpyear[idl] === year) {
        var start = new Date(date);
        var end = new Date(cdpyear[idl] + '-' + cdpmonth[idl] + '-' + date.getDate());

        var yearDiff = end.getFullYear() - start.getFullYear();
        var monthDiff = end.getMonth() - start.getMonth();

        var totalMonths = (yearDiff * 12) + monthDiff;
        let ostmonth = Number(months) - Number(totalMonths) - 1
        let over = (precent/12*((1+precent/12))**ostmonth)/(((1+precent/12)**ostmonth)-1)
        sj = (ej - pr + Number(cdpsumm[idl]))
        summ2 -= sj
        ej = over * summ2
        idl++
      } else {
        sj = (ej - pr)
        summ2 -= sj
      }

      // if (summ2 < (sj * 2)) {
      //   sj+= summ2
      //   index = months
      //   summ2 -= sj
      // }

      if (mes >= 12) {
        mes = 1
        year++
      }else{
        mes++
      }
      let justdate = new Date(year+'-'+mes+'-'+date.getDate()).toLocaleDateString() 
      if (index === months -1) {
          ret.push([justdate,pr + sj+summ2+sms,pr, sj+summ2, summ2-summ2, this.state.sms])
      }else{
        ret.push([justdate,pr + sj + sms,pr, sj, summ2, this.state.sms])
      }
    }
    return ret
  }
  sum(x) {
    let s = 0;
    for (let index = 0; index < x.length; index++) {
      s += x[index]
    }
    return s
  }

  smsinfo() {
    const sms = this.state.sms
    if (sms > 0) {
      return [(<th>Смс</th>)]
    }
  }
  render() {
    const { inputs } = this.state;
    const onChange = (date, dateString) => {
      this.setState({date: dateString})
    };
    return (
      <section>
        <section className={this.state.grafic}>
            <div className='table'>
                <div className='table_title'>
                  <h1>Расчет по кредиту</h1>
                  <Button className='btn' onClick={e=>this.setState({grafic: 'none', main: 'box'})}>Закрыть</Button>
                </div>
                <div className='wraped'>
                  <div className='block_rs'>
                    <p>Сумма кредита</p>
                    <h1>{Intl.NumberFormat("ru-RU", {style: "currency", currency: "RUB"}).format(this.state.summ)}</h1>
                  </div>
                  <div className='block_rs'>
                    <p>Процент</p>
                    <h1>{this.state.precent + "%"}</h1>
                  </div>
                </div>
                <div className='wraped'>
                  <div className='block_rs'>
                    <p>Кол-во месяцев</p>
                    <h1>{this.state.months}</h1>
                  </div>
                  <div className='block_rs'>
                    <p>Дата получения</p>
                    <h1>{new Date(this.state.date).toLocaleDateString()}</h1>
                  </div>
                </div>
                <div className='wraped'>
                  <div className='block_rs'>
                    <p>Сумма переплаты</p>
                    <h1>{Intl.NumberFormat("ru-RU", {style: "currency", currency: "RUB"}).format(this.round10(this.sum(this.grafic().map(el=>el[2]))), -2)}</h1>
                  </div>
                  <div className='block_rs'>
                    <p>Смс информирование</p>
                    <h1>{Intl.NumberFormat("ru-RU", {style: "currency", currency: "RUB"}).format(this.state.sms)}</h1>
                  </div>
                </div>
                <Button onClick={e=>window.print()} className='btn'>Печатать</Button>
                <div className='overwlo'>
                  <table className='tabel tab'>
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Платёж</th>
                        <th>Процент</th>
                        <th>Тело кредита</th>
                        {(this.smsinfo())}
                        <th>Остаток</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.grafic().map((el)=>(
                      <tr>
                        <th>{el[0]}</th>
                        <th>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[1])}</th>
                        <th>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[2] + Number(this.state.sms))}</th>
                        <th>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[3])}</th>
                        { (this.state.sms > 0) ? (<th>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(Number(el[5]))}</th>) : (<div className='none'></div>) }
                        <th>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[4])}</th>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
        </section>







        <form className={this.state.main}>
          <div className='header_box'>
            <h2 className='title'>Кредитный калькулятор</h2>
          </div>
          <div className='input_group'>
            <div>
              <label>Сумма кредита</label>
              <IMaskInput
              mask={Number}
              max='999999999'
              thousandsSeparator=" "
              unmask={true}
              onAccept={(value, mask) => this.setState({summ: value})}
              className='input'/>
            </div>
            <div>
              <label>Процентная ставка</label>
              <IMaskInput
              mask={Number}
              max='99'
              thousandsSeparator=' '
              unmask={true}
              onAccept={
                (value, mask) => {this.setState({precent: Number(value)})
                console.log(typeof(Number(value)))
                console.log(Number(value))}
              }
              placeholder=''
              className='input'/>
            </div>
          </div>
          <div className='input_group'>
            <div>
              <label>Кол-во месяцев</label>
              <IMaskInput
              mask={Number}
              radix='.'
              thousandsSeparator='.'
              unmask={true}
              onAccept={
                (value, mask) => this.setState({months: value})
              }
              className='input'/>
            </div>
            <div>
              <label>Дата получения</label>
              <DatePicker onChange={onChange} className='w100' />
              {/* <input type='date' onChange={event=>this.setState({date: event.target.value})} className='input'/> */}
            </div>
          </div>
          <div className='input_group'>
              <div>
                <label>смс информирование</label>
                <IMaskInput
                mask={Number}
                max='9999'
                thousandsSeparator=" "
                unmask={true}
                onAccept={(value, mask) => this.setState({sms: value})}
                className='input'/>
              </div>
              <section className={this.state.pdp}>
                <label>ПДП</label>
                <input type='date' onChange={e=>this.setState({pdpdate: e.target.value})} className='input'/>
              </section>
          </div>
          <div className='input_group'>
            <h1>Частичное погашение</h1>
          </div>
          {inputs.map((input, index) => (
          <div className='input_group' key={index}>
            <div>
              <label>Дата</label>
              <DatePicker className='w100' onChange={(date, dateString) => this.handleInputChange(index, dateString)} />
              {/* <DatePicker onChange={event => this.handleInputChange(index, event)} /> */}
            {/* <input className='input'
              value={input}
              type='date'
              onChange={event => this.handleInputChange(index, event)}
            /> */}
            <label>Сумма чдп</label>
            <input className='input'
              
              onChange={event => this.handleCdpChange(index, event)}
            />
            </div>
            <Button className='btn' onClick={(e) => {this.removeInput(index); e.preventDefault()}}>Удалить</Button>
          </div>
        ))}
          <div className='btn_group'>
          <nav>
            <Button onClick={(e) => {this.addInput(); e.preventDefault()}} className='btn'>ЧПД</Button>
            { (this.state.pdp === 'none') ? <Button onClick={e=>{this.setState({pdp: 'pdp'}); e.preventDefault()}} className='btn'>+ПДП</Button> : <Button onClick={e=>{this.setState({pdp: 'none', pdpdate: 0}); e.preventDefault()}} className='btn'>-ПДП</Button> }
          </nav>
              { (this.state.summ > 0 && this.state.months > 0 && this.state.precent > 0 && this.state.date !== 0) ? (<Button type='primary' onClick={e=>{this.setState({grafic: 'block', main: 'none'}); e.preventDefault()}}>Расчитать</Button>) : (<Button disabled>Расчитать</Button>) }
          </div>
        </form>
      </section>
    )
  }
}
