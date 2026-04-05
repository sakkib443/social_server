import { Router } from 'express';
import { friendController } from './friend.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', friendController.getFriends);
router.get('/requests', friendController.getPendingRequests);
router.get('/suggestions', friendController.getSuggestions);
router.post('/request/:userId', friendController.sendRequest);
router.put('/accept/:requestId', friendController.acceptRequest);
router.put('/reject/:requestId', friendController.rejectRequest);
router.delete('/:friendId', friendController.removeFriend);

export const FriendRoutes = router;
