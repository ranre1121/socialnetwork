import type { Request, Response } from "express";
interface AuthenticatedRequest extends Request {
    user?: {
        username: string;
    };
}
export declare function addPost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getFeedPosts(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deletePost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function likePost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addComment(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getComments(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=postsControllers.d.ts.map