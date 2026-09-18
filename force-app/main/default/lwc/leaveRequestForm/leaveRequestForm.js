import { LightningElement } from 'lwc';
import createLeaveRequest from '@salesforce/apex/LeaveRequestController.createLeaveRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LeaveRequestForm extends LightningElement {

    employeeId = '';
    leaveType = '';
    leaveReason = '';
    fromDate = '';
    toDate = '';

    leaveTypeOptions = [
        {
            label: 'Sick Leave',
            value: 'Sick Leave'
        },
        {
            label: 'Casual Leave',
            value: 'Casual Leave'
        },
        {
            label: 'Earned Leave',
            value: 'Earned Leave'
        },
        {
            label: 'Maternity Leave',
            value: 'Maternity Leave'
        }
    ];

    handleEmployeeChange(event) {
        this.employeeId = event.detail.recordId;
    }

    handleLeaveTypeChange(event) {
        this.leaveType = event.detail.value;
    }

    handleReasonChange(event) {
        this.leaveReason = event.target.value;
    }

    handleFromDateChange(event) {
        this.fromDate = event.target.value;
    }

    handleToDateChange(event) {
        this.toDate = event.target.value;
    }

    handleSubmit() {

        console.log('Submit button clicked');

        /*
         * ------------------------------------------------
         * 1. Employee validation
         * ------------------------------------------------
         */
        if (!this.employeeId) {
            this.showToast(
                'Employee Required',
                'Please select an Employee.',
                'error'
            );
            return;
        }

        /*
         * ------------------------------------------------
         * 2. Leave Type validation
         * ------------------------------------------------
         */
        if (!this.leaveType) {
            this.showToast(
                'Leave Type Required',
                'Please select a Leave Type.',
                'error'
            );
            return;
        }

        /*
         * ------------------------------------------------
         * 3. From Date validation
         * ------------------------------------------------
         */
        if (!this.fromDate) {

            const fromInput =
                this.template.querySelector(
                    'lightning-input[name="fromDate"]'
                );

            if (fromInput) {
                fromInput.setCustomValidity(
                    'From Date is required.'
                );
                fromInput.reportValidity();
            }

            return;
        }

        /*
         * ------------------------------------------------
         * 4. To Date validation
         * ------------------------------------------------
         */
        if (!this.toDate) {

            const toInput =
                this.template.querySelector(
                    'lightning-input[name="toDate"]'
                );

            if (toInput) {
                toInput.setCustomValidity(
                    'To Date is required.'
                );
                toInput.reportValidity();
            }

            return;
        }

        /*
         * Clear previous date validation errors
         */
        const fromInput =
            this.template.querySelector(
                'lightning-input[name="fromDate"]'
            );

        const toInput =
            this.template.querySelector(
                'lightning-input[name="toDate"]'
            );

        if (fromInput) {
            fromInput.setCustomValidity('');
        }

        if (toInput) {
            toInput.setCustomValidity('');
        }

        /*
         * ------------------------------------------------
         * 5. Date comparison
         * ------------------------------------------------
         */
        const from =
            new Date(this.fromDate + 'T00:00:00');

        const to =
            new Date(this.toDate + 'T00:00:00');

        if (to < from) {

            if (toInput) {
                toInput.setCustomValidity(
                    'To Date cannot be earlier than From Date.'
                );
                toInput.reportValidity();
            }

            this.showToast(
                'Invalid Dates',
                'To Date cannot be earlier than From Date.',
                'error'
            );

            return;
        }

        /*
         * ------------------------------------------------
         * 6. Maximum 15 days validation
         * ------------------------------------------------
         */
        const daysDifference =
            (to - from) /
            (1000 * 60 * 60 * 24);

        if (daysDifference > 15) {

            if (toInput) {
                toInput.setCustomValidity(
                    'You cannot apply for more than 15 days at once.'
                );
                toInput.reportValidity();
            }

            this.showToast(
                'Invalid Leave Duration',
                'You cannot apply for more than 15 days at once.',
                'error'
            );

            return;
        }

        /*
         * ------------------------------------------------
         * 7. Sick Leave reason validation
         * ------------------------------------------------
         */
        if (
            this.leaveType === 'Sick Leave' &&
            !this.leaveReason.trim()
        ) {

            this.showToast(
                'Leave Reason Required',
                'Leave Reason is required for Sick Leave.',
                'error'
            );

            return;
        }

        /*
         * ------------------------------------------------
         * 8. Call Apex
         * ------------------------------------------------
         */
        console.log('Calling Apex with:', {
            employeeId: this.employeeId,
            leaveType: this.leaveType,
            leaveReason: this.leaveReason,
            fromDate: this.fromDate,
            toDate: this.toDate
        });

        createLeaveRequest({
            employeeId: this.employeeId,
            leaveType: this.leaveType,
            leaveReason: this.leaveReason,
            fromDate: this.fromDate,
            toDate: this.toDate
        })
            .then((recordId) => {

                console.log(
                    'Leave request created successfully:',
                    recordId
                );

                this.showToast(
                    'Success',
                    'Leave request created successfully.',
                    'success'
                );

                /*
                 * Reset form
                 */
                this.employeeId = '';
                this.leaveType = '';
                this.leaveReason = '';
                this.fromDate = '';
                this.toDate = '';

                /*
                 * Reset date validation
                 */
                if (fromInput) {
                    fromInput.setCustomValidity('');
                }

                if (toInput) {
                    toInput.setCustomValidity('');
                }
            })
            .catch((error) => {

                console.error(
                    'Leave Request Error:',
                    error
                );

                let message =
                    'Unable to create leave request.';

                if (
                    error &&
                    error.body &&
                    error.body.message
                ) {
                    message = error.body.message;
                }
                else if (
                    error &&
                    error.message
                ) {
                    message = error.message;
                }

                this.showToast(
                    'Error',
                    message,
                    'error'
                );
            });
    }

    showToast(title, message, variant) {

        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}