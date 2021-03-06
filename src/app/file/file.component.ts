import { Component, OnInit, NgZone } from '@angular/core';
import { IpfsService } from '@service/ipfs.service';
import { InfoService } from '@service/info.service';

declare var require: any

const clipboard = require('clipboard');
const filesize = require('filesize');

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {

  index: number

  name: string

  size: number

  pctg: string

  progress: number

  ipfsLink: string

  canShareLink: string

  ipfsHash: string

  isUploading: boolean = true
  streamEnded: boolean = false

  filesize: any

  copiedText: string = 'copy-file-link'

  constructor(
    private zone: NgZone,
    private ipfs: IpfsService,
    public info: InfoService) {
    this.filesize = filesize
  }

  ngOnInit() {
  }

  renderIpfsLink() {
    let link = `${this.ipfs.gatewayURL}/${this.ipfsHash}`;

    this.ipfsLink = link;

    this.canShareLink = `https://canshare.io/share/${this.ipfsHash}?name=${this.name}&size=${this.size}`;

    this.zone.run(() => console.log('file zone ran'));

    let self = this

    new clipboard(`.copy-${this.ipfsHash}`, {
      text: function(trigger) {

        self.copiedText = 'copied'
        trigger.classList.add('copied');
        setTimeout(() => {
          self.copiedText = 'copy-file-link';
          trigger.classList.remove('copied');
        }, 2000);

        return link;
      }
    });
  }

}
