import { LightningElement, api } from 'lwc';

export default class OpportunityList extends LightningElement {
    @api records;
    @api stage;
    @api isprocessing;

    get isProcessing(){
        return this.isprocessing;
    }

    itemDragHandler(e){
        this.dispatchEvent(new CustomEvent('itemdrag', {detail: e.detail}));
    }

    dragOverHandler(e){
        e.preventDefault();
    }

    dropHandler(e){
        this.dispatchEvent(new CustomEvent('itemdrop', {detail: this.stage}) );
    }
}