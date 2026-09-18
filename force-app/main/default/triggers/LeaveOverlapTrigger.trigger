trigger LeaveOverlapTrigger on Leave_Information__c (before insert) {

    Set<Id> employeeIds = new Set<Id>();

    for (Leave_Information__c leave : Trigger.new) {
        if (leave.Employee__c != null) {
            employeeIds.add(leave.Employee__c);
        }
    }

    if (employeeIds.isEmpty()) {
        return;
    }

    List<Leave_Information__c> existingLeaves = [
        SELECT
            Id,
            Employee__c,
            From__c,
            To__c
        FROM Leave_Information__c
        WHERE Employee__c IN :employeeIds
    ];

    for (Leave_Information__c newLeave : Trigger.new) {

        if (
            newLeave.Employee__c == null ||
            newLeave.From__c == null ||
            newLeave.To__c == null
        ) {
            continue;
        }

        for (Leave_Information__c existingLeave : existingLeaves) {

            if (
                existingLeave.Employee__c == newLeave.Employee__c &&
                existingLeave.From__c != null &&
                existingLeave.To__c != null &&
                newLeave.From__c <= existingLeave.To__c &&
                newLeave.To__c >= existingLeave.From__c
            ) {

                newLeave.addError(
                    'Overlapping leave is not allowed for the same employee.'
                );

                break;
            }
        }
    }
}