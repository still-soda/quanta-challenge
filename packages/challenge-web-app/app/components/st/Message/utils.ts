import type { Placement, PlacementHorizontal, PlacementVertical } from './type';

export const getPlacementInAxis = (
   placement: Placement
): [PlacementHorizontal, PlacementVertical] => {
   const [vertical, horizontal] = placement.split('-') as [
      PlacementVertical,
      PlacementHorizontal
   ];
   return [horizontal || 'center', vertical || 'center'];
};
