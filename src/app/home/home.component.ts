import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EthService } from '../eth.service';
import { CurrencyService } from '@service/currency.service';
import * as moment from 'moment';

declare var BancorConvertWidget: any

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  // Current user?
  currentUser: any = JSON.parse( localStorage.getItem('credentials') );

  loading = false;
  state = 'loaded';
  balance = 0;
  account = 'INSERT ETH ADDRESS HERE';

  firstTime = localStorage.getItem('firstTime') || 'YES';
  invoice = JSON.parse( localStorage.getItem( localStorage.getItem('currentInvoice') || '001') )
    || {
    id: '001',
    logo: 'assets/img/logo.svg',
    to: 'Satoshi Nakamoto \n700 Cypherpunk Way \nSanta Clara, CA 95050, USA',
    from: 'Vitalik But.\n520 ETHernal St\nKolomna, Moscow Oblast\nRussia',
    date: moment().format('YYYY-MM-DD'),
    option: { title: 'Tax', value: '0', type: 'Percent (%)', config: { prefix: '', suffix: ' %', precision: 0 } },
    paid: 0,
    items: [
      { title: 'Whitepaper writing service', quantity: 1, rate: '200' },
    ],
    terms: `To be paid to Ethereum address: ${this.account}`
  };

  invoicesAsObject = JSON.parse( localStorage.getItem('invoices') ) || {};
  invoicesAsList = [];

  constructor(private router: Router,
    private activatedRoute:  ActivatedRoute,
    private ethService: EthService,
    public currencyService: CurrencyService) {

  }

  ngOnInit() {
    console.log('invoicesAsObject', this.invoicesAsObject);
  }

  ngAfterViewInit() {
    BancorConvertWidget.init({
      'type': '1',
      'baseCurrencyId': '5a6f61ece3de16000123763a',
      'pairCurrencyId': '5937d635231e97001f744267',
      'primaryColor': '#00BFFF',
      'primaryColorHover': '#55DAFB'
    });

    this.activatedRoute.params.subscribe( (params) => {
      // PARAM? = params['query'] ? params['query'] : '';
    });
    setTimeout( () => {
      this.transformInvoices();
    }, 1000);
  }

  transformInvoices() {
    this.invoicesAsList = [];
    for (const key of Object.keys(this.invoicesAsObject)) {
      this.invoicesAsList.push( this.invoicesAsObject[key] );
    }
    console.log('transformInvoices', this.invoicesAsList);
  }

  getSum(): number {
    if (!this.invoice || (this.invoice && !this.invoice.items) ) {
      return;
    }

    let sum = 0;
    for (let i = 0; i < this.invoice.items.length; i++) {
      sum += (this.invoice.items[i].quantity * this.invoice.items[i].rate);
    }
    return sum;
  }

  getTotal(): number {
    let total = 0;
    if ( this.invoice.option.type === 'Flat ($)' ) {
      total = this.getSum() + parseFloat(this.invoice['option']['value']);
    } else {
      total = this.getSum() + ( this.getSum() * ( parseFloat(this.invoice['option']['value']) / 100 ) );
    }
    total -= this.invoice.paid;
    return total;
  }

  addInvoiceToList() {
    console.log('addInvoiceToList', this.invoice);
    this.invoicesAsObject[ this.invoice.id ] = JSON.parse( JSON.stringify( this.invoice ) );
    localStorage.setItem('invoices', JSON.stringify( this.invoicesAsObject ) );
    this.transformInvoices();
  }

  onFirstTime() {
    localStorage.setItem('firstTime', 'NO');
  }

  onNewInvoice() {
    console.log('onNewInvoice', this.invoice.id);
  }

  onInvoiceSelected(event: any) {
    console.log('onInvoiceSelected', event);
    this.invoice = event;
  }

  onSaveInvoice() {
    localStorage.setItem('currentInvoice', this.invoice.id);
    localStorage.setItem(this.invoice.id, JSON.stringify(this.invoice) );
  }

  onChangeLogo() {
    (<any>window).$('#fileLogo').click();
  }

  onFile(event: any) {
    if (event && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.invoice.logo = e.target.result;
        this.onSaveInvoice();
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  onRemoveLogo() {
    this.invoice['logo'] = null;
    this.onSaveInvoice();
  }

  onAddItem() {
    if ( this.invoice && this.invoice['items'] instanceof Array) {
      this.invoice['items'].push( { title: '', quantity: 1, rate: '0' } );
    }
  }

  onRemoveItem(idx: number, item: any) {
    this.invoice['items'].splice(idx, 1);
    this.onSaveInvoice();
  }

  onOption(option: string) {
    this.invoice['option']['type'] = option;
    this.invoice['option']['config'] = option === 'Flat ($)' ? { prefix: '$ ', suffix: '', precision: 2 } : { prefix: '', suffix: ' %', precision: 0 };
    this.onSaveInvoice();
  }

  onPrint() {
    this.onSaveInvoice();
    this.addInvoiceToList();
    (<any>window).print();
  }

}
