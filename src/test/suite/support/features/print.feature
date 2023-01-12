Feature: Print functionality
    The printer can place documents in a Queue and print them one by one

    Scenario: The printer can add documents to the queue
        Given a printer in operating mode
        When I create a temporary file named 'temp.txt'
        And I add the 'temp.txt' file to the printer queue
        Then the printer queue length is '1'

    Scenario Outline: The printer will go in Error state when an invalid document is provided
        Given a printer in operating mode
        When I create an invalid file named '<filename>'
        And I add the '<filename>' file to the printer queue
        Then the printer is in '<state>' state
        Examples:
            | filename                  | state |
            | no_extension              | ERROR |


