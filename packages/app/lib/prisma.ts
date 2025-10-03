import prisma from '@challenge/database';
import { TrackWrapper } from './track-wrapper';

export const tracker = new TrackWrapper();

export default tracker.wrap(prisma);
