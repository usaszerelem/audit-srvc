/**
 * @swagger
 * components:
 *   schemas:
 *     Audit:
 *       required:
 *         - timestamp
 *         - userId
 *         - source
 *         - method
 *         - data
 *       type: object
 *       properties:
 *         timeStamp:
 *           type: string
 *           description: ISO 8601 format timestampt
 *           example: 2023-08-16T10:00:00.000Z
 *         userId:
 *           type: string
 *           description: Unique user entity ID that generated this audit event
 *           example: 64adc0fe7a9c9d385950dfe2
 *         source:
 *           type: string
 *           description: Source application from where this event originates from. Ensure always use the same value for the same application so that grouping of audit logs is simplified.
 *           example:
 *         method:
 *           type: string
 *           description: HTTP method in upper case that was being processed when this even was triggered.
 *           example: GET
 *         data:
 *           type: string
 *           description: Application specified data that should be associated with this event.
 *           example: Product name changed from 'this' to 'that'.
 *
 *     AuditResponse:
 *       required:
 *         - timestamp
 *         - userId
 *         - source
 *         - method
 *         - data
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique audit entity identifier
 *           example: 64de3b16d810d5460d56549c
 *         timeStamp:
 *           type: string
 *           description: ISO 8601 format timestampt
 *           example: 2023-08-16T10:00:00.000Z
 *         userId:
 *           type: string
 *           description: Unique user entity ID that generated this audit event
 *           example: 64adc0fe7a9c9d385950dfe2
 *         source:
 *           type: string
 *           description: Source application from where this event originates from. Ensure always use the same value for the same application so that grouping of audit logs is simplified.
 *           example:
 *         method:
 *           type: string
 *           description: HTTP method in upper case that was being processed when this even was triggered.
 *           example: GET, POST, PUT, DELETE, ...
 *         data:
 *           type: string
 *           description: Application specified data that should be associated with this event.
 *           example: Product name changed from 'this' to 'that'.
 *         createdAt:
 *           type: string
 *           description: Timestamp of when this entity was created
 *           example: "2023-08-16T13:45:42.676Z"
 *         updatedAt:
 *           type: string
 *           description: Timestamp of when this entity was last updated
 *           example: "2023-08-16T13:45:42.676Z"
 *
 *     AuditGetResponse:
 *       type: object
 *       properties:
 *         pageSize:
 *           type: number
 *           example: 10
 *           description: Maximum number of entities that this page can contain.
 *         pageNumber:
 *           type: number
 *           example: 2
 *           description: Requested page number of entities.
 *         _links:
 *           type: object
 *           properties:
 *             base:
 *               type: string
 *               example: "http://localhost:3000/api/products"
 *               description: Base URL to use for retrieving products information
 *             prev:
 *               type: string
 *               example: "http://localhost:3000/api/products?pageSize=10&pageNumber=1"
 *               description: URL to use to retreive the previous page with products information. This property is only returned if there is a previous page with information, therebody allowing the UI to enable/disable paging controls.
 *             next:
 *               type: string
 *               example: "http://localhost:3000/api/products?pageSize=10&pageNumber=3"
 *               description: URL to use to retreive the next page with products information. This property is only returned if there is a next page with information, therebody allowing the UI to enable/disable paging controls.
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AuditResponse'
 */

export default interface AuditDto {
    _id?: string;
    timeStamp: Date;
    userId: string;
    source: string;
    method: string;
    data: string;
}

export interface AuditGetAllDto {
    pageSize: Number;
    pageNumber: Number;
    _links: {
        base: string;
        next?: string;
        prev?: string;
    };
    results: AuditDto[];
}
