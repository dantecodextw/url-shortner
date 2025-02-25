import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { Response } from "express";
import { PostgresError } from 'pg';

interface ErrorResponse {
    statusCode: number;
    errorCode: string;
    message: string;
    details: any;
    timestamp: string;
    debug?: any;
}


@Catch(QueryFailedError)
export default class QueryFailedExceptionHandler implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const postgresError = exception.driverError as PostgresError

        let errorResponse: ErrorResponse = this.handleDatabaseError(postgresError)

        if (process.env.NODE_ENV === 'development') {
            errorResponse.debug = {
                orginalError: exception,
                stack: exception.stack
            }
        }

        response.status(errorResponse.statusCode).json(errorResponse)
    }

    private handleDatabaseError(postgresError: PostgresError): ErrorResponse {
        switch (postgresError?.code) {
            case "23505":
                return this.handleDuplicateKey(postgresError)

            default:
                break;
        }
    }

    private handleDuplicateKey(postgresError: PostgresError) {
        const fieldMatch = postgresError?.detail?.match(/Key \((.*?)\)/);
        const field = fieldMatch ? fieldMatch[1] : 'unknown';

        // Extract the conflicting value using a more precise regex pattern.
        const valueMatch = postgresError?.detail?.match(/\)=\((.*?)\)/);
        const value = valueMatch ? valueMatch[1] : 'unknown';

        return {
            statusCode: 400,
            errorCode: 'DUPLICATE_KEY',
            message: 'The provided data conflicts with existing records.',
            details: {
                field, value
            },
            timestamp: new Date().toISOString()
        }
    }
}
