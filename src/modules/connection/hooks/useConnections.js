import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { useToast } from '../../../hooks/useToast';
import {
  getConnections,
  acceptConnection,
  declineConnection,
  removeConnection,
} from '../api/connectionApi';
import { CONNECTION_ERROR_MAP } from '../constants/connection.constants';
import {
  setPending,
  setAccepted,
  setLoading,
  setError,
  removePending,
  removeAccepted,
} from '../redux/connectionSlice';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Safe ObjectId/string equality check */
const sameId = (a, b) =>
  String(a?._id || a?.id || a) === String(b?._id || b?.id || b);

/** Compute age in years from a dateOfBirth string */
const calcAge = (dob) => {
  if (!dob) return null;
  const ms = Date.now() - new Date(dob).getTime();
  return Math.max(0, Math.floor(ms / (365.25 * 24 * 3_600_000)));
};

/**
 * Normalise a raw connection document into a flat card-friendly shape.
 * Both requesterId and recipientId must be populated objects from the API.
 */
const mapConnection = (conn, parentId) => {
  const isRequester = sameId(conn.requesterId, parentId);
  const other = isRequester ? conn.recipientId : conn.requesterId;
  const child = other?.child ?? null;

  return {
    id: String(conn._id),
    status: conn.status,
    // keep the full partner parent object so QuickProfileCard can read it
    partnerParent: other,
    childName: child?.displayName || 'Bé',
    childAge: calcAge(child?.dateOfBirth),
    parentName: other?.fullName || 'Phụ huynh',
    isVerified: !!other?.verification?.isVerifiedParent,
    interests: child?.interests?.join(', ') || '',
    location:
      other?.location?.address ||
      other?.location?.area ||
      other?.location?.city ||
      '',
    avatarUrl:
      child?.avatarUrl ||
      other?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        other?.fullName || 'B'
      )}&background=EAF3EC&color=3d6841`,
    // presence is not yet served by the BE — always false until socket presence is added
    isOnline: false,
  };
};

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * useConnections — domain hook for the Connection feature.
 *
 * Responsibilities:
 * - Fetch pending (incoming only) and accepted connections and store them in Redux.
 * - Expose accept / decline / remove actions with toast feedback and state updates.
 * - Map BE error codes through CONNECTION_ERROR_MAP via getApiErrorMsg.
 *
 * Pages & components MUST NOT call connectionApi.* directly.
 */
const useConnections = () => {
  const dispatch = useDispatch();
  const currentParent = useSelector((state) => state.auth.parent);
  const parentId = currentParent?._id || currentParent?.id;
  const { pending, accepted, isLoading, error: fetchError } = useSelector(
    (state) => state.connection
  );
  const { success, error: toastError } = useToast();

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!parentId) {
      dispatch(setLoading(false));
      return;
    }
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const [pendingRes, acceptedRes] = await Promise.all([
        getConnections('pending'),
        getConnections('accepted'),
      ]);

      // apiClient wraps response: { data: { data: [...] } } or plain array
      const unwrap = (res) => {
        const body = res?.data ?? res;
        return Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      };

      const pendingRaw = unwrap(pendingRes);
      const acceptedRaw = unwrap(acceptedRes);

      // Only show INCOMING requests on the "Lời mời" tab
      const incoming = pendingRaw.filter((c) => sameId(c.recipientId, parentId));

      dispatch(setPending(incoming.map((c) => mapConnection(c, parentId))));
      dispatch(setAccepted(acceptedRaw.map((c) => mapConnection(c, parentId))));
    } catch (err) {
      const msg = getApiErrorMsg(CONNECTION_ERROR_MAP, err, 'Không thể tải danh sách kết nối.');
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  }, [parentId, dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── actions ──────────────────────────────────────────────────────────────
  
  const accept = useCallback(
    async (id) => {
      try {
        await acceptConnection(id);
        success('Đã chấp nhận lời mời kết nối!');
        // Ideally we would move the connection from pending to accepted locally, 
        // but for simplicity and data consistency, we re-fetch all.
        await fetchAll();
        return true;
      } catch (err) {
        const msg = getApiErrorMsg(CONNECTION_ERROR_MAP, err);
        toastError(msg);
        return false;
      }
    },
    [fetchAll, success, toastError]
  );

  const decline = useCallback(
    async (id) => {
      try {
        await declineConnection(id);
        success('Đã từ chối lời mời kết nối.');
        dispatch(removePending(id));
        return true;
      } catch (err) {
        const msg = getApiErrorMsg(CONNECTION_ERROR_MAP, err);
        toastError(msg);
        return false;
      }
    },
    [dispatch, success, toastError]
  );

  const remove = useCallback(
    async (id) => {
      try {
        await removeConnection(id);
        success('Đã hủy kết nối.');
        dispatch(removeAccepted(id));
        return true;
      } catch (err) {
        const msg = getApiErrorMsg(CONNECTION_ERROR_MAP, err);
        toastError(msg);
        return false;
      }
    },
    [dispatch, success, toastError]
  );

  return {
    /** Incoming pending connection requests (recipient = current user) */
    pending,
    /** Accepted (friend) connections */
    accepted,
    isLoading,
    /** Non-null when the initial fetch failed */
    fetchError,
    accept,
    decline,
    remove,
    /** Manual refresh — e.g. pull-to-refresh */
    refresh: fetchAll,
  };
};

export default useConnections;
