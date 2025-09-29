import type { Request, Response } from "express";
export declare function findFriends(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
export declare function addRequest(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
export declare function cancelRequest(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
export declare function getRequests(req: any, res: Response): Response<any, Record<string, any>> | undefined;
export declare function acceptRequest(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
export declare function declineRequest(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
export declare function listFriends(req: any, res: Response): Response<any, Record<string, any>> | undefined;
export declare function deleteFriend(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=friendsControllers.d.ts.map