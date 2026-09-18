import { LightningElement, wire } from 'lwc';
import getMyLeaveHistory from '@salesforce/apex/MyLeaveHistoryController.getMyLeaveHistory';

export default class MyLeaveHistory extends LightningElement {

    leaveRecords = [];
    errorMessage = '';
    isLoading = true;

    columns = [
        {
            label: 'Leave Information',
            fieldName: 'Name'
        },
        {
            label: 'Leave Type',
            fieldName: 'Leave_Type__c'
        },
        {
            label: 'Leave Status',
            fieldName: 'Leave_Status__c'
        },
        {
            label: 'Leave Reason',
            fieldName: 'Leave_Reason__c'
        },
        {
            label: 'From',
            fieldName: 'From__c',
            type: 'date'
        },
        {
            label: 'To',
            fieldName: 'To__c',
            type: 'date'
        },
        {
            label: 'Days Applied',
            fieldName: 'Days_Applied__c',
            type: 'number'
        }
    ];

    @wire(getMyLeaveHistory)
    wiredLeaveHistory({ data, error }) {

        this.isLoading = false;

        if (data) {

            this.leaveRecords = data;
            this.errorMessage = '';

        } else if (error) {

            this.leaveRecords = [];

            if (
                error.body &&
                error.body.message
            ) {
                this.errorMessage = error.body.message;
            } else {
                this.errorMessage =
                    'Unable to load leave history.';
            }
        }
    }

    get hasRecords() {
        return this.leaveRecords.length > 0;
    }

    get showNoRecords() {
        return (
            !this.isLoading &&
            !this.errorMessage &&
            this.leaveRecords.length === 0
        );
    }
}