public with sharing class MyLeaveHistoryController {

    @AuraEnabled(cacheable=true)
    public static List<Leave_Information__c> getMyLeaveHistory() {

        String currentUserEmail = UserInfo.getUserEmail();

        List<Employee__c> employees = [
            SELECT Id
            FROM Employee__c
            WHERE Email__c = :currentUserEmail
            LIMIT 1
        ];

        if (employees.isEmpty()) {
            return new List<Leave_Information__c>();
        }

        return [
            SELECT
                Id,
                Name,
                Leave_Type__c,
                Leave_Status__c,
                Leave_Reason__c,
                From__c,
                To__c,
                Days_Applied__c
            FROM Leave_Information__c
            WHERE Employee__c = :employees[0].Id
            ORDER BY From__c DESC
        ];
    }
}