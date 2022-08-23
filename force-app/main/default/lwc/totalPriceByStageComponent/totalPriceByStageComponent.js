import { LightningElement, api } from 'lwc';

export default class TotalPriceByStageComponent extends LightningElement {
    @api stage;
    @api amountsByStage;

    get totalAmountByStage() { 
        return (this.amountsByStage[this.stage]) ? this.amountsByStage[this.stage] : 0;
    }
}