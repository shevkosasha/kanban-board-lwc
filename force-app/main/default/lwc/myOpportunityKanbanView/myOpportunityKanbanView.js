import { LightningElement, api, wire, track } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getListUi } from 'lightning/uiListApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';

export default class MyOpportunityKanbanView extends LightningElement {

    @track rtId;
    @track error;
    records;
    recordId;
    totalAmountsByStage = {};
    isProcessing =false;    

    @wire(getListUi, {
        objectApiName: OPPORTUNITY_OBJECT,
        listViewApiName:'AllOpportunities'
    })
    wiredListView({error, data}){
        if(data){
            this.records = data.records.records.map(item => {
                let fields = item.fields;
                let account = fields.Account.value.fields;
                return {
                    'Id': fields.Id.value, 
                    'Name': fields.Name.value, 
                    'AccountId': account.Id.value, 
                    'AccountName': account.Name.value, 
                    'CloseDate': fields.CloseDate.value, 
                    'StageName': fields.StageName.value, 
                    'Amount': fields.Amount.value 
                }
            });
            this.totalAmountsByStage = {};
            this.records.forEach(item => {
                if (Object.keys(this.totalAmountsByStage).includes(item.StageName)) {
                    this.totalAmountsByStage[item.StageName] += item.Amount;
                } else {
                    this.totalAmountsByStage[item.StageName] = item.Amount;
                }
            });
        }
        if(error){
            console.error(error)
        }
    }

    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    saveResult({error, data}) {
        if(data) {
            this.rtId = data.defaultRecordTypeId;
        } else {
            this.error = error;
        }
    }

    @wire(getPicklistValues, {recordTypeId: "$rtId", fieldApiName: STAGE_FIELD})
    picklistValues;

    get hasPicklistValues() {
        return this.picklistValues && this.picklistValues.data && this.picklistValues.data.values;
    }

    get width(){
        return `width: calc(100vw/ ${this.picklistValues.data.values.length + 1})`;
    }  

    get isProcessing(){
        return this.isProcessing;
    }

    handleItemDrag(event){
        this.recordId = event.detail;
    }

    handleItemDrop(event){
        let stage = event.detail; 
        this.records = this.records.map(item => {
            if (item.Id === this.recordId) {
                item.StageName = stage;
            } 
            return item;
        });
        this.updateStage(stage);        
    }

    updateStage(stage){
        this.isProcessing = true;
        const recordToUpdate = {};
        recordToUpdate[ID_FIELD.fieldApiName] = this.recordId;
        recordToUpdate[STAGE_FIELD.fieldApiName] = stage;
        updateRecord({ fields: recordToUpdate })
            .then(()=>{
                this.isProcessing = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title:'Success',
                        message:'Stage updated successfully',
                        variant:'success'
                    })
                );
                return refreshApex(this.wiredListView);
            }).catch(error=>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title:'Error',
                        message:'Unfortunately stage is not updated',
                        variant:'error'
                    })
                );
                console.error(error);
            })
    }    
}