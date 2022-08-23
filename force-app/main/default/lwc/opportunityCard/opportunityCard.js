import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

export default class OpportunityCard extends NavigationMixin(LightningElement) {
    @api stage
    @api record

    get isSameStage(){
        return this.stage === this.record.StageName
    }

    navigateHandler(Id, apiName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: Id,
                objectApiName: apiName,
                actionName: 'view',
            },
        });
    }

    openOpportunityHandler(e){
        e.preventDefault();
        this.navigateHandler(e.target.dataset.id, 'Opportunity');
    }

    openAccountHandler(e){
        e.preventDefault();
        this.navigateHandler(e.target.dataset.id, 'Account');
    }
    
    itemDragStartHandler(){
        this.dispatchEvent(new CustomEvent('itemdragstart', {detail: this.record.Id}));
    }
}