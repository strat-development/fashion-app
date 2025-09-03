import { supabase } from '../../lib/supabase';

export interface UserStatistics {
  createdCount: number;
  savedCount: number;
  likesReceivedCount: number;
}

export const fetchUserStatistics = async (userId: string): Promise<UserStatistics> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const [createdResult, savedResult, userOutfitsResult] = await Promise.all([
      // Count created outfits
      supabase
        .from('created-outfits')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId),
      
      supabase
        .from('saved-outfits')
        .select('*', { count: 'exact', head: true })
        .eq('saved_by', userId),
      
      supabase
        .from('created-outfits')
        .select('outfit_id')
        .eq('created_by', userId)
    ]);

    const { count: createdCount, error: createdError } = createdResult;
    const { count: savedCount, error: savedError } = savedResult;
    const { data: userOutfits, error: userOutfitsError } = userOutfitsResult;

    if (createdError) {
      console.error('Error fetching created outfits count:', createdError);
      throw new Error(`Failed to fetch created outfits: ${createdError.message || 'Unknown error'}`);
    }

    if (savedError) {
      console.error('Error fetching saved outfits count:', savedError);
      throw new Error(`Failed to fetch saved outfits: ${savedError.message || 'Unknown error'}`);
    }

    if (userOutfitsError) {
      console.error('Error fetching user outfits for likes count:', userOutfitsError);
      throw new Error(`Failed to fetch user outfits: ${userOutfitsError.message || 'Unknown error'}`);
    }

    let likesReceivedCount = 0;
    if (userOutfits && userOutfits.length > 0) {
      const outfitIds = userOutfits.map(outfit => outfit.outfit_id).filter(Boolean);
      
      if (outfitIds.length > 0) {
        const { count: likesCount, error: likesError } = await supabase
          .from('outfits-rating')
          .select('*', { count: 'exact', head: true })
          .in('outfit_id', outfitIds)
          .eq('top_rated', true);

        if (likesError) {
          console.error('Error fetching likes count:', likesError);
          likesReceivedCount = 0;
        } else {
          likesReceivedCount = likesCount || 0;
        }
      }
    }

    return {
      createdCount: createdCount || 0,
      savedCount: savedCount || 0,
      likesReceivedCount,
    };
  } catch (error) {
    console.error('Error in fetchUserStatistics:', error);
    throw error;
  }
};
