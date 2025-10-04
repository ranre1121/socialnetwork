import type { Request, Response } from "express";
export declare function findFriends(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function addRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function acceptRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function declineRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listFriends(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteFriend(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=friendsControllers.d.ts.map