import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ReviewFilters from './ReviewFilters';
import ReviewCard from './ReviewCard';
import Icon from '../../../components/AppIcon';

const MOCK_REVIEWS = [
  { id: '1', rating: 5, comment: 'Excelente servicio, el cafe estaba perfecto y la atencion fue muy amable. Definitivamente volvere pronto.', trigger_type: 'checkin', customer_name: 'Carlos M.', customer_level: 'Oro', review_status: 'published', tags: ['Buen servicio', 'Cafe excelente', 'Ambiente agradable'], photos: [], created_at: new Date(Date.now() - 86400000)?.toISOString(), reply: null },
  { id: '2', rating: 4, comment: 'Muy buen lugar, el ambiente es genial. El cafe podria estar un poco mas caliente pero en general muy bien.', trigger_type: 'coupon_redeem', customer_name: 'Ana L.', customer_level: 'Plata', review_status: 'published', tags: ['Buen ambiente', 'Cafe rico'], photos: [], created_at: new Date(Date.now() - 172800000)?.toISOString(), reply: { content: 'Gracias Ana por tu comentario! Tomamos nota sobre la temperatura del cafe.', published_at: new Date(Date.now() - 160000000)?.toISOString() } },
  { id: '3', rating: 5, comment: 'El mejor cafe de la zona sin duda. Personal muy atento y el lugar siempre limpio.', trigger_type: 'checkin', customer_name: 'Roberto S.', customer_level: 'Oro', review_status: 'published', tags: ['Limpieza', 'Atencion al cliente'], photos: [], created_at: new Date(Date.now() - 259200000)?.toISOString(), reply: null },
  { id: '4', rating: 2, comment: 'Tuve que esperar mas de 20 minutos para que me atendieran. El cafe estaba frio cuando llego. No es lo que esperaba.', trigger_type: 'order_completed', customer_name: 'Maria G.', customer_level: 'Bronce', review_status: 'published', tags: ['Tiempo de espera', 'Temperatura'], photos: [], created_at: new Date(Date.now() - 345600000)?.toISOString(), reply: { content: 'Lamentamos mucho tu experiencia Maria. Te invitamos a regresar.', published_at: new Date(Date.now() - 300000000)?.toISOString() } },
  { id: '5', rating: 3, comment: 'El lugar es bonito pero el servicio fue lento. El cafe estaba bien pero nada especial.', trigger_type: 'reservation_completed', customer_name: 'Luis P.', customer_level: 'Bronce', review_status: 'published', tags: ['Servicio lento'], photos: [], created_at: new Date(Date.now() - 432000000)?.toISOString(), reply: null },
  { id: '6', rating: 5, comment: 'Increible experiencia. El barista me recomendo el espresso con leche de avena y fue una revelacion. 10/10.', trigger_type: 'checkin', customer_name: 'Sofia R.', customer_level: 'Plata', review_status: 'published', tags: ['Recomendaciones', 'Barista experto'], photos: [], created_at: new Date(Date.now() - 518400000)?.toISOString(), reply: { content: 'Sofia, nos alegra que hayas descubierto el espresso con leche de avena!', published_at: new Date(Date.now() - 500000000)?.toISOString() } },
  { id: '7', rating: 1, comment: 'Pesima experiencia. Me cobraron de mas y cuando reclame fueron groseros. No recomiendo este lugar para nada.', trigger_type: 'coupon_redeem', customer_name: 'Jorge T.', customer_level: 'Bronce', review_status: 'reported', tags: ['Cobro incorrecto', 'Mal trato'], photos: [], created_at: new Date(Date.now() - 604800000)?.toISOString(), reply: null },
  { id: '8', rating: 4, comment: 'Buen cafe y buena musica. El lugar tiene mucho encanto. Los pasteles son deliciosos tambien.', trigger_type: 'geofence_visit', customer_name: 'Patricia V.', customer_level: 'Plata', review_status: 'published', tags: ['Musica', 'Pasteles', 'Ambiente'], photos: [], created_at: new Date(Date.now() - 691200000)?.toISOString(), reply: null },
  { id: '9', rating: 5, comment: 'Vine con mi familia y todos quedamos encantados. Los ninos disfrutaron mucho y el personal fue muy paciente.', trigger_type: 'checkin', customer_name: 'Fernando H.', customer_level: 'Oro', review_status: 'published', tags: ['Familiar', 'Personal amable'], photos: [], created_at: new Date(Date.now() - 777600000)?.toISOString(), reply: { content: 'Fernando, que gusto que toda la familia haya disfrutado!', published_at: new Date(Date.now() - 760000000)?.toISOString() } },
  { id: '10', rating: 3, comment: 'El cafe esta bien pero los precios son un poco altos para lo que ofrecen. El lugar es pequeno y a veces hay mucho ruido.', trigger_type: 'order_completed', customer_name: 'Carmen D.', customer_level: 'Bronce', review_status: 'published', tags: ['Precio', 'Ruido'], photos: [], created_at: new Date(Date.now() - 864000000)?.toISOString(), reply: null },
  { id: '11', rating: 4, comment: 'Me gusto mucho el ambiente. El wifi funciona bien y pude trabajar tranquilamente por horas.', trigger_type: 'checkin', customer_name: 'Miguel A.', customer_level: 'Plata', review_status: 'published', tags: ['Wifi', 'Trabajo remoto'], photos: [], created_at: new Date(Date.now() - 950400000)?.toISOString(), reply: null },
  { id: '12', rating: 5, comment: 'El mejor cappuccino que he tomado en mi vida. La crema estaba perfecta y el sabor era intenso pero equilibrado.', trigger_type: 'coupon_redeem', customer_name: 'Isabella C.', customer_level: 'Oro', review_status: 'published', tags: ['Cappuccino', 'Calidad'], photos: [], created_at: new Date(Date.now() - 1036800000)?.toISOString(), reply: null },
  { id: '13', rating: 2, comment: 'Servicio muy lento y el personal parecia desorganizado. Tuve que pedir mi orden dos veces.', trigger_type: 'reservation_completed', customer_name: 'Eduardo N.', customer_level: 'Bronce', review_status: 'published', tags: ['Servicio lento', 'Desorganizacion'], photos: [], created_at: new Date(Date.now() - 1123200000)?.toISOString(), reply: null },
  { id: '14', rating: 4, comment: 'Lugar acogedor con buena seleccion de cafes de especialidad. Me explico el origen de cada grano. Muy educativo.', trigger_type: 'geofence_visit', customer_name: 'Valentina O.', customer_level: 'Plata', review_status: 'published', tags: ['Cafe de especialidad', 'Educativo'], photos: [], created_at: new Date(Date.now() - 1209600000)?.toISOString(), reply: null },
  { id: '15', rating: 5, comment: 'Visita perfecta de principio a fin. Llegue en hora pico y aun asi el servicio fue rapido y el cafe impecable.', trigger_type: 'checkin', customer_name: 'Alejandro B.', customer_level: 'Oro', review_status: 'published', tags: ['Rapidez', 'Impecable'], photos: [], created_at: new Date(Date.now() - 1296000000)?.toISOString(), reply: null },
];

const ReviewsManagementTab = () => {
  const [filters, setFilters] = useState({ rating: 'all', origin: 'all', status: 'all', period: '7d', search: '', sort: 'recent' });
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase?.from('reviews')?.select('*, review_replies(*)')?.order('created_at', { ascending: false })?.limit(50);
      if (!error && data?.length > 0) {
        const mapped = data?.map(r => ({
          ...r,
          tags: Array.isArray(r?.tags) ? r?.tags : (typeof r?.tags === 'string' ? JSON.parse(r?.tags || '[]') : []),
          photos: Array.isArray(r?.photos) ? r?.photos : [],
          reply: r?.review_replies?.[0] || null,
        }));
        setReviews(mapped);
      }
    } catch (e) {
      // use mock data
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (reviewId, content) => {
    try {
      await supabase?.from('review_replies')?.insert({ review_id: reviewId, content });
    } catch (e) {}
  };

  const handleReport = async (reviewId, reason, description) => {
    try {
      await supabase?.from('review_reports')?.insert({ review_id: reviewId, reason, description });
      await supabase?.from('reviews')?.update({ review_status: 'reported' })?.eq('id', reviewId);
      setReviews(prev => prev?.map(r => r?.id === reviewId ? { ...r, review_status: 'reported' } : r));
    } catch (e) {}
  };

  const filtered = reviews?.filter(r => {
    if (filters?.rating !== 'all' && String(r?.rating) !== filters?.rating) return false;
    if (filters?.origin !== 'all' && r?.trigger_type !== filters?.origin) return false;
    if (filters?.status === 'pending_reply' && r?.reply) return false;
    if (filters?.status === 'replied' && !r?.reply) return false;
    if (filters?.status === 'reported' && r?.review_status !== 'reported') return false;
    if (filters?.search) {
      const q = filters?.search?.toLowerCase();
      if (!r?.comment?.toLowerCase()?.includes(q) && !r?.customer_name?.toLowerCase()?.includes(q)) return false;
    }
    return true;
  })?.sort((a, b) => {
    if (filters?.sort === 'worst') return a?.rating - b?.rating;
    if (filters?.sort === 'unreplied') return (a?.reply ? 1 : 0) - (b?.reply ? 1 : 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const paginated = filtered?.slice(0, page * PAGE_SIZE);
  const hasMore = paginated?.length < filtered?.length;

  return (
    <div>
      <ReviewFilters filters={filters} onFiltersChange={setFilters} />
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
            <Icon name="MessageSquare" size={28} className="text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground mb-1">No se encontraron reseñas</p>
          <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{filtered?.length} reseña{filtered?.length !== 1 ? 's' : ''} encontrada{filtered?.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-4">
            {paginated?.map(review => (
              <ReviewCard key={review?.id} review={review} onReplySubmit={handleReplySubmit} onReport={handleReport} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button onClick={() => setPage(p => p + 1)} className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2">
                <Icon name="ChevronDown" size={15} />Cargar más reseñas
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsManagementTab;
