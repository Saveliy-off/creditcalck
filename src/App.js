import React, { Component } from 'react'
import { IMaskInput } from 'react-imask';

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
    }
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
    // Сдвиг разрядов
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Обратный сдвиг
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
    // const arras = [new Date("2023-06-17").getMonth() + 1, new Date("2023-06-17").getFullYear(), 90000]
    const overpayment = this.overpayment();
    let ej = overpayment * summ
    const date =  new Date(this.state.date);
    let summ2 = summ
    let mes = date.getMonth() + 1
    let year = date.getFullYear()
    let ret = [[date.toLocaleDateString(), 0, 0, 0, summ, 0]]
    for (let index = 0; index < months; index++) {
      let pr = summ2 * precent * this.howMuchDays(year, mes) / this.days_of_a_year(year)
      let sj = (ej - pr)
      summ2 -= sj
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
    return (
      <section>
        <section className={this.state.grafic}>
            <div className='table'>
                <div className='table_title'>
                  <h1>Расчет по кредиту</h1>
                  <button className='btn' onClick={e=>this.setState({grafic: 'none', main: 'box'})}>Закрыть</button>
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
                <button onClick={e=>window.print()} className='btn'>Печатать</button>
                <div className='overwlo'>
                  <table className='tabel'>
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
              placeholder="250 000"
              className='input'/>
            </div>
            <div>
              <label>Процентная ставка</label>
              <IMaskInput
              mask="09.99"
              thousandsSeparator='.'
              unmask={false}
              onAccept={
                (value, mask) => this.setState({precent: value})
              }
              placeholder='18.00'
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
              placeholder='18'
              className='input'/>
            </div>
            <div>
              <label>Дата получения</label>
              <input type='date' onChange={e=>this.setState({date: e.target.value})} className='input'/>
            </div>
          </div>
          {/* <div className='btn_group'>
            <div>
              <button disabled className='btn'>ЧПД</button>
            </div>
            <div>
              <button disabled className='btn'>ПДП</button>
            </div>
          </div> */}
          <div className='input_group'>
              <div>
                <label>смс информирование</label>
                <IMaskInput
                mask={Number}
                max='9999'
                thousandsSeparator=" "
                unmask={true}
                onAccept={(value, mask) => this.setState({sms: value})}
                placeholder="199"
                className='input'/>
              </div>
          </div>
          <div className='btn_group'>
          <nav>
            <button disabled className='btn'>ЧПД</button>
            <button disabled className='btn'>ПДП</button>
          </nav>
              { (this.state.summ > 0 && this.state.months > 0 && this.state.precent > 0 && this.state.date !== 0) ? (<button onClick={e=>{this.setState({grafic: 'block', main: 'none'}); e.preventDefault()}} className='btn primary'>Расчитать</button>) : (<button disabled className='btn'>Расчитать</button>) }
          </div>
        </form>
      </section>
    )
  }
}
