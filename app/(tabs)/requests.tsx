import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useChat } from '@/contexts/ChatContext';
import { useRouter } from 'expo-router';
  import { supabase, supabaseClient } from '@/lib/supabase';
import { Request, User } from '@/types/supabase';

// Tipos extendidos para las consultas con joins
interface RequestWithRelations extends Request {
  usuario?: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    empresa: string;
  };
  agente?: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    categoria?: string;
  };
}
import {
  Plus,
  Clock,
  CircleCheck as CheckCircle,
  TriangleAlert as AlertTriangle,
  Send,
  X,
  User as UserIcon,
  Activity as ActivityIndicator,
  MessageCircle,
} from 'lucide-react-native';
import { AdvancedSearchComponent } from '@/components/AdvancedSearchComponent';
import { FileUploadComponent } from '@/components/FileUploadComponent';
import { uploadMultipleFiles, UploadResult } from '@/utils/fileUpload';

export default function Requests() {
  const [requests, setRequests] = useState<RequestWithRelations[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestWithRelations[]>([]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ uri: string; name: string; type: string; size: number }>
  >([]);
  const [newRequest, setNewRequest] = useState({
    titulo: '',
    mensaje: '',
    tipo: 1,
    prioridad: 'media' as const,
    agente_id: '',
  });

  const { user } = useAuth();
  const { sendDemoNotification } = useNotifications();
  const { createChatRoom } = useChat();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadRequests();
      loadAgents();
    }
  }, [user]);

  useEffect(() => {
    setFilteredRequests(requests);
  }, [requests]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('requests')
        .select(
          `
          *,
          usuario:users!requests_usuario_id_fkey(id, nombre, apellido_paterno, apellido_materno, empresa),
          agente:users!requests_agente_id_fkey(id, nombre, apellido_paterno, apellido_materno, categoria)
        `
        )
        .order('created_at', { ascending: false });

      // Filtrar según el rol del usuario
      if (user.rol === 'customer') {
        query = query.eq('usuario_id', user.id);
      } else if (user.rol === 'agent') {
        query = query.eq('agente_id', user.id);
      }
      // Los admins pueden ver todas las solicitudes

      const { data, error } = await query;

      if (error) {
        console.error('Error loading requests:', error);
        setError(`Error al cargar las solicitudes: ${error.message}`);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError(
        `Error al cargar las solicitudes: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          'id, nombre, apellido_paterno, apellido_materno, categoria, zona'
        )
        .eq('rol', 'agent')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error loading agents:', error);
        return;
      }

      setAgents(data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nuevo':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'asignado':
        return <Clock size={16} color="#3b82f6" />;
      case 'en_proceso':
        return <Clock size={16} color="#8b5cf6" />;
      case 'pausado':
        return <AlertTriangle size={16} color="#ef4444" />;
      case 'resuelto':
        return <CheckCircle size={16} color="#10b981" />;
      case 'cerrado':
        return <CheckCircle size={16} color="#6b7280" />;
      default:
        return <AlertTriangle size={16} color="#6b7280" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nuevo':
        return 'Nuevo';
      case 'asignado':
        return 'Asignado';
      case 'en_proceso':
        return 'En proceso';
      case 'pausado':
        return 'Pausado';
      case 'resuelto':
        return 'Resuelto';
      case 'cerrado':
        return 'Cerrado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo':
        return '#f59e0b';
      case 'asignado':
        return '#3b82f6';
      case 'en_proceso':
        return '#8b5cf6';
      case 'pausado':
        return '#ef4444';
      case 'resuelto':
        return '#10b981';
      case 'cerrado':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja':
        return '#10b981';
      case 'media':
        return '#f59e0b';
      case 'alta':
        return '#ef4444';
      case 'urgente':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFullName = (usuario: any) => {
    if (!usuario) return 'Usuario desconocido';
    return `${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno}`.trim();
  };

  const getAgentFullName = (agent: User) => {
    return `${agent.nombre} ${agent.apellido_paterno} ${agent.apellido_materno}`.trim();
  };

  const handleCreateRequest = async () => {
    if (!newRequest.titulo || !newRequest.mensaje) {
      Alert.alert('Error', 'Por favor completa el título y mensaje');
      return;
    }

    if (newRequest.titulo.length < 5 || newRequest.titulo.length > 200) {
      Alert.alert('Error', 'El título debe tener entre 5 y 200 caracteres');
      return;
    }

    if (newRequest.mensaje.length < 10) {
      Alert.alert('Error', 'El mensaje debe tener al menos 10 caracteres');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    setSubmitting(true);
    try {
      // Validate agent exists if selected
      if (newRequest.agente_id) {
        const { data: agentExists, error: agentError } = await supabase
          .from('users')
          .select('id')
          .eq('id', newRequest.agente_id)
          .eq('rol', 'agent')
          .eq('activo', true)
          .single();

        if (agentError || !agentExists) {
          console.error('Agent validation error:', agentError);
          Alert.alert('Error', 'El agente seleccionado no está disponible');
          setSubmitting(false);
          return;
        }
      }

      // Upload files to Supabase Storage if any
      let uploadedFiles: UploadResult[] = [];
      if (selectedFiles.length > 0) {
        try {
          console.log(`Uploading ${selectedFiles.length} file(s) to storage...`);
          uploadedFiles = await uploadMultipleFiles(
            selectedFiles,
            'request-files',
            `requests/${user.id}`
          );
          console.log(`Successfully uploaded ${uploadedFiles.length} file(s)`);
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          Alert.alert(
            'Error al subir archivos',
            'No se pudieron subir los archivos adjuntos. ¿Deseas continuar sin archivos?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => { setSubmitting(false); } },
              { text: 'Continuar sin archivos', onPress: () => { /* Continue without files */ } }
            ]
          );
          setSubmitting(false);
          return;
        }
      }

      // Properly typed request data
      const requestData: {
        titulo: string;
        mensaje: string;
        tipo: number;
        prioridad: 'baja' | 'media' | 'alta' | 'urgente';
        estatus: 'nuevo';
        usuario_id: string;
        agente_id: string | null;
        archivos: string[];
        tags: string[];
        metadata: Record<string, any>;
      } = {
        titulo: newRequest.titulo.trim(),
        mensaje: newRequest.mensaje.trim(),
        tipo: newRequest.tipo,
        prioridad: newRequest.prioridad,
        estatus: 'nuevo',
        usuario_id: user.id,
        agente_id: newRequest.agente_id || null,
        archivos: uploadedFiles.map(file => file.url),
        tags: [],
        metadata: {
          files: uploadedFiles.map(file => ({
            name: file.name,
            url: file.url,
            path: file.path,
            type: file.type,
            size: file.size,
          })),
          created_from: 'mobile',
          app_version: '1.0.0',
        },
      };

      console.log('Creating request with data:', {
        titulo: requestData.titulo,
        tipo: requestData.tipo,
        prioridad: requestData.prioridad,
        usuario_id: requestData.usuario_id,
        agente_id: requestData.agente_id,
      });

      const { data, error } = await supabaseClient
        .from('requests')
        .insert(requestData)
        .select(
          `
          *,
          usuario:users!requests_usuario_id_fkey(nombre, apellido_paterno, apellido_materno, empresa),
          agente:users!requests_agente_id_fkey(nombre, apellido_paterno, apellido_materno, categoria)
        `
        )
        .single();

      if (error) {
        console.error('Error creating request:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        Alert.alert(
          'Error al crear solicitud',
          `No se pudo crear la solicitud: ${error.message}\n\nPor favor intenta de nuevo.`
        );
        return;
      }

      if (!data) {
        console.error('No data returned from insert');
        Alert.alert('Error', 'No se recibió confirmación de la solicitud creada');
        return;
      }

      console.log('Request created successfully:', data.id);

      // Agregar la nueva solicitud a la lista
      setRequests(prev => [data as RequestWithRelations, ...prev]);

      // Limpiar formulario
      setNewRequest({
        titulo: '',
        mensaje: '',
        tipo: 1,
        prioridad: 'media',
        agente_id: '',
      });
      setSelectedFiles([]);
      setShowNewRequestModal(false);

      // Enviar notificación al usuario
      try {
        await sendDemoNotification(
          'Solicitud creada',
          `Tu solicitud "${data.titulo}" ha sido enviada correctamente`,
          'success',
          { requestId: data.id }
        );
      } catch (notifError) {
        console.error('Error sending user notification:', notifError);
        // No bloquear si falla la notificación
      }

      // Si se asignó un agente, enviar notificación al agente
      if (data.agente_id) {
        try {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: data.agente_id,
              title: 'Nueva solicitud asignada',
              body: `Se te ha asignado la solicitud "${data.titulo}"`,
              type: 'assignment',
              priority: 'medium',
              data: { requestId: data.id },
              read: false,
            });

          if (notifError) {
            console.error('Error sending agent notification:', notifError);
          }
        } catch (notifError) {
          console.error('Error sending agent notification:', notifError);
          // No bloquear si falla la notificación
        }
      }

      Alert.alert('Éxito', 'Solicitud creada correctamente');
    } catch (error) {
      console.error('Unexpected error creating request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert(
        'Error',
        `Error inesperado al crear la solicitud: ${errorMessage}\n\nPor favor intenta de nuevo.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    newStatus: string
  ) => {
    try {
      // Usar el cliente sin tipos estrictos para evitar errores de 'never'
      const { error } = await supabaseClient
        .from('requests')
        .update({
          estatus: newStatus,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating request status:', error);
        return;
      }

      // Actualizar la lista local
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                estatus: newStatus as any,
                updated_at: new Date().toISOString(),
              }
            : req
        )
      );

      // Enviar notificación al usuario
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await sendDemoNotification(
          'Solicitud actualizada',
          `Tu solicitud "${request.titulo}" cambió a: ${getStatusText(newStatus)}`,
          'info',
          { requestId }
        );
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleSearch = (filters: any) => {
    let filtered = requests;

    // Filtrar por texto
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        req =>
          req.titulo.toLowerCase().includes(query) ||
          req.mensaje.toLowerCase().includes(query) ||
          (req.agente && getFullName(req.agente).toLowerCase().includes(query))
      );
    }

    // Filtrar por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(req => filters.status.includes(req.estatus));
    }

    // Filtrar por prioridad
    if (filters.priority.length > 0) {
      filtered = filtered.filter(req =>
        filters.priority.includes(req.prioridad)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleClearSearch = () => {
    setFilteredRequests(requests);
  };

  const handleFileSelected = (file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  }) => {
    setSelectedFiles(prev => [...prev, file]);
  };

  const handleFileRemoved = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartChat = async (request: RequestWithRelations) => {
    try {
      // Determinar el ID del otro participante
      let otherParticipantId: string;
      let otherParticipantName: string;

      if (user?.rol === 'customer') {
        // Si soy cliente, abrir chat con el agente
        if (!request.agente_id || !request.agente) {
          Alert.alert(
            'Sin agente asignado',
            'Esta solicitud no tiene un agente asignado aún. Espera a que un agente sea asignado para iniciar el chat.'
          );
          return;
        }
        otherParticipantId = request.agente_id;
        otherParticipantName = getFullName(request.agente);
      } else {
        // Si soy agente o admin, abrir chat con el cliente
        if (!request.usuario_id || !request.usuario) {
          Alert.alert('Error', 'No se pudo encontrar el usuario de esta solicitud');
          return;
        }
        otherParticipantId = request.usuario_id;
        otherParticipantName = getFullName(request.usuario);
      }

      // Crear o obtener el chat room
      const roomId = await createChatRoom(
        otherParticipantId,
        otherParticipantName,
        request.id
      );

      // Navegar al chat
      router.push(`/chat/${roomId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'No se pudo iniciar el chat. Intenta de nuevo.');
    }
  };

  // Simular cambios de estado automáticos para demo
  useEffect(() => {
    if (requests.length === 0) return;

    const interval = setInterval(() => {
      // Cambiar estado aleatoriamente para demo
      if (Math.random() > 0.95) {
        const pendingRequests = requests.filter(r =>
          ['nuevo', 'asignado', 'en_proceso'].includes(r.estatus)
        );

        if (pendingRequests.length > 0) {
          const randomRequest =
            pendingRequests[Math.floor(Math.random() * pendingRequests.length)];
          let newStatus = randomRequest.estatus;

          if (randomRequest.estatus === 'nuevo') {
            newStatus = 'asignado';
          } else if (randomRequest.estatus === 'asignado') {
            newStatus = 'en_proceso';
          } else if (
            randomRequest.estatus === 'en_proceso' &&
            Math.random() > 0.7
          ) {
            newStatus = 'resuelto';
          }

          if (newStatus !== randomRequest.estatus) {
            handleUpdateRequestStatus(randomRequest.id, newStatus);
          }
        }
      }
    }, 15000); // Cada 15 segundos

    return () => clearInterval(interval);
  }, [requests]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Solicitudes</Text>
              <Text style={styles.subtitle}>Cargando...</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Solicitudes</Text>
              <Text style={styles.subtitle}>Error al cargar</Text>
            </View>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRequests}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Solicitudes</Text>
            <Text style={styles.subtitle}>
              {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
              {user?.rol === 'customer' ? '' : ' asignadas'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewRequestModal(true)}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Advanced Search */}
      <View style={styles.searchSection}>
        <AdvancedSearchComponent
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder="Buscar solicitudes..."
        />
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredRequests.map(request => (
          <TouchableOpacity
            key={request.id}
            style={styles.requestCard}
            onPress={() => {
              // Mostrar opciones para cambiar estado (solo para agentes y admins)
              if (user?.rol === 'agent' || user?.rol === 'admin') {
                const statusOptions = [
                  { text: 'Cancelar', style: 'cancel' as const },
                  {
                    text: 'Asignar',
                    onPress: () =>
                      handleUpdateRequestStatus(request.id, 'asignado'),
                  },
                  {
                    text: 'En Proceso',
                    onPress: () =>
                      handleUpdateRequestStatus(request.id, 'en_proceso'),
                  },
                  {
                    text: 'Pausar',
                    onPress: () =>
                      handleUpdateRequestStatus(request.id, 'pausado'),
                  },
                  {
                    text: 'Resolver',
                    onPress: () =>
                      handleUpdateRequestStatus(request.id, 'resuelto'),
                  },
                  {
                    text: 'Cerrar',
                    onPress: () =>
                      handleUpdateRequestStatus(request.id, 'cerrado'),
                  },
                ];

                Alert.alert(
                  'Cambiar Estado',
                  `Solicitud: ${request.titulo}`,
                  statusOptions
                );
              }
            }}
          >
            <View style={styles.requestHeader}>
              <View style={styles.requestStatus}>
                {getStatusIcon(request.estatus)}
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(request.estatus) },
                  ]}
                >
                  {getStatusText(request.estatus)}
                </Text>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(request.prioridad) },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {request.prioridad.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.requestDate}>
                {formatDate(request.created_at)}
              </Text>
            </View>

            <Text style={styles.requestTitle}>{request.titulo}</Text>
            <Text style={styles.requestMessage} numberOfLines={3}>
              {request.mensaje}
            </Text>

            {/* Información del usuario (para agentes y admins) */}
            {(user?.rol === 'agent' || user?.rol === 'admin') &&
              request.usuario && (
                <View style={styles.userInfo}>
                  <UserIcon size={16} color="#6b7280" />
                  <Text style={styles.userName}>
                    Cliente: {getFullName(request.usuario)} -{' '}
                    {request.usuario.empresa}
                  </Text>
                </View>
              )}

            {/* Información del agente (para clientes) */}
            {user?.rol === 'customer' && request.agente && (
              <View style={styles.agentInfo}>
                <UserIcon size={16} color="#6b7280" />
                <Text style={styles.agentName}>
                  Agente: {getFullName(request.agente)} -{' '}
                  {request.agente.categoria}
                </Text>
              </View>
            )}

            {/* Mostrar si no hay agente asignado */}
            {!request.agente_id && (
              <View style={styles.noAgentInfo}>
                <AlertTriangle size={16} color="#f59e0b" />
                <Text style={styles.noAgentText}>Sin agente asignado</Text>
              </View>
            )}

            {/* Archivos adjuntos */}
            {request.archivos && request.archivos.length > 0 && (
              <View style={styles.attachmentsInfo}>
                <Text style={styles.attachmentsText}>
                  📎 {request.archivos.length} archivo
                  {request.archivos.length !== 1 ? 's' : ''} adjunto
                  {request.archivos.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {/* Feedback si está resuelto */}
            {request.estatus === 'resuelto' && request.feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackLabel}>Comentarios:</Text>
                <Text style={styles.feedbackText}>{request.feedback}</Text>
                {request.rating && (
                  <Text style={styles.ratingText}>
                    Calificación: {'⭐'.repeat(request.rating)} (
                    {request.rating}/5)
                  </Text>
                )}
              </View>
            )}

            {/* Botón Charlar */}
            <TouchableOpacity
              style={styles.chatButton}
              onPress={(e) => {
                e.stopPropagation();
                handleStartChat(request);
              }}
            >
              <MessageCircle size={18} color="#ffffff" />
              <Text style={styles.chatButtonText}>Charlar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {requests.length === 0
                ? 'No tienes solicitudes aún'
                : 'No se encontraron solicitudes'}
            </Text>
            <Text style={styles.emptySubtext}>
              {requests.length === 0
                ? 'Toca el botón + para crear tu primera solicitud'
                : 'Intenta con otros filtros de búsqueda'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Nueva Solicitud */}
      <Modal
        visible={showNewRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Solicitud</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNewRequestModal(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Describe brevemente tu solicitud"
                placeholderTextColor="#9ca3af"
                value={newRequest.titulo}
                onChangeText={text =>
                  setNewRequest(prev => ({ ...prev, titulo: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Solicitud</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeScroll}
              >
                {[
                  { id: 1, name: 'Ventas' },
                  { id: 2, name: 'Soporte' },
                  { id: 3, name: 'Cotización' },
                  { id: 4, name: 'Rastreo de pedidos' },
                ].map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      newRequest.tipo === type.id && styles.typeChipSelected,
                    ]}
                    onPress={() =>
                      setNewRequest(prev => ({ ...prev, tipo: type.id }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        newRequest.tipo === type.id &&
                          styles.typeChipTextSelected,
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Prioridad</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.priorityScroll}
              >
                {[
                  { value: 'baja', label: 'Baja', color: '#10b981' },
                  { value: 'media', label: 'Media', color: '#f59e0b' },
                  { value: 'alta', label: 'Alta', color: '#ef4444' },
                  { value: 'urgente', label: 'Urgente', color: '#dc2626' },
                ].map(priority => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityChip,
                      newRequest.prioridad === priority.value && {
                        backgroundColor: priority.color,
                        borderColor: priority.color,
                      },
                    ]}
                    onPress={() =>
                      setNewRequest(prev => ({
                        ...prev,
                        prioridad: priority.value as any,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.priorityChipText,
                        newRequest.prioridad === priority.value &&
                          styles.priorityChipTextSelected,
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {agents.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Agente Destino (Opcional)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.agentsScroll}
                >
                  {agents.map(agent => (
                    <TouchableOpacity
                      key={agent.id}
                      style={[
                        styles.agentChip,
                        newRequest.agente_id === agent.id &&
                          styles.agentChipSelected,
                      ]}
                      onPress={() =>
                        setNewRequest(prev => ({
                          ...prev,
                          agente_id: agent.id,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.agentChipText,
                          newRequest.agente_id === agent.id &&
                            styles.agentChipTextSelected,
                        ]}
                      >
                        {getAgentFullName(agent)}
                      </Text>
                      <Text
                        style={[
                          styles.agentChipCategory,
                          newRequest.agente_id === agent.id &&
                            styles.agentChipCategorySelected,
                        ]}
                      >
                        {agent.categoria}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mensaje *</Text>
              <FileUploadComponent
                onFileSelected={handleFileSelected}
                onFileRemoved={handleFileRemoved}
                files={selectedFiles}
                maxFiles={3}
                maxSizeInMB={5}
              />
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Describe tu solicitud en detalle..."
                placeholderTextColor="#9ca3af"
                value={newRequest.mensaje}
                onChangeText={text =>
                  setNewRequest(prev => ({ ...prev, mensaje: text }))
                }
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleCreateRequest}
              disabled={submitting}
            >
              <Send size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1e40af',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  requestDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  requestTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  agentName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  noAgentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noAgentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#f59e0b',
  },
  attachmentsInfo: {
    marginBottom: 8,
  },
  attachmentsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  feedbackContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  feedbackLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e3a8a',
    lineHeight: 20,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1e40af',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeScroll: {
    flexGrow: 0,
  },
  typeChip: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 120,
  },
  typeChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  typeChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
  },
  typeChipTextSelected: {
    color: '#1e40af',
  },
  priorityScroll: {
    flexGrow: 0,
  },
  priorityChip: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 80,
  },
  priorityChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
  },
  priorityChipTextSelected: {
    color: '#ffffff',
  },
  agentsScroll: {
    flexGrow: 0,
  },
  agentChip: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 200,
  },
  agentChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  agentChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  agentChipTextSelected: {
    color: '#1e40af',
  },
  agentChipCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  agentChipCategorySelected: {
    color: '#3b82f6',
  },
  submitButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
