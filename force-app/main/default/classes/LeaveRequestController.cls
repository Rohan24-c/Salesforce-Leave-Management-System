public with sharing class LeaveRequestController {

    @AuraEnabled
    public static Id createLeaveRequest(
        Id employeeId,
        String leaveType,
        String leaveReason,
        Date fromDate,
        Date toDate
    ) {
        try {
            Leave_Information__c leaveRequest =
                new Leave_Information__c();

            leaveRequest.Employee__c = employeeId;
            leaveRequest.Leave_Type__c = leaveType;
            leaveRequest.Leave_Reason__c = leaveReason;
            leaveRequest.From__c = fromDate;
            leaveRequest.To__c = toDate;
            leaveRequest.Leave_Status__c = 'Pending';

            insert leaveRequest;

            return leaveRequest.Id;

        } catch (DmlException e) {

            String errorMessage =
                e.getDmlMessage(0);

            throw new AuraHandledException(
                errorMessage
            );
        }
    }
}