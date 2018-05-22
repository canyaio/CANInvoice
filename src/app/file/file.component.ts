import { Component, OnInit, NgZone } from '@angular/core';
import { IpfsService } from '@service/ipfs.service';

declare var require: any

const clipboard = require('clipboard');

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {

  index: number

  name: string

  size: number

  pctg: number

  progress: number

  ipfsLink: string

  canShareLink: string

  ipfsHash: string

  isUploading: boolean = true
  streamEnded: boolean = false

  constructor(
    private zone: NgZone,
    private ipfs: IpfsService) { }

  ngOnInit() {
  }

  renderIpfsLink() {
    console.log(this.ipfsHash);

    let link = `${this.ipfs.gatewayURL}/${this.ipfsHash}`;

    this.ipfsLink = link;

    this.canShareLink = `https://canshare.io/share/${this.ipfsHash}?name=invoice 001`;

    this.zone.run(() => console.log('file zone ran'));

    new clipboard(`.copy-${this.ipfsHash}`, {
      text: function(trigger) {

        trigger.innerText = 'Copied!';
        trigger.classList.add('copied');
        setTimeout(() => {
          trigger.innerText = 'Copy file link';
          trigger.classList.remove('copied');
        }, 2000);

        return link;
      }
    });
  }

}
