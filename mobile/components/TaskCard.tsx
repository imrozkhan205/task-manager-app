// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { Task } from '../services/api';

// interface TaskCardProps {
//   task: Task;
//   onEdit: () => void;
//   onDelete: () => void;
// }

// export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {

//   const getPriorityInfo = (priority: 'low' | 'medium' | 'high') => {
//     switch(priority) {
//       case 'low': return { label: 'LOW', color: '#2ecc71' };
//       case 'medium': return { label: 'MEDIUM', color: '#f1c40f' };
//       case 'high': return { label: 'HIGH', color: '#e74c3c' };
//       default: return { label: 'MEDIUM', color: '#f1c40f' };
//     }
//   };

//   return (
//     <View style={{ padding: 16, backgroundColor: '#fff', marginBottom: 12, borderRadius: 12 }}>
//       <Text style={{ fontWeight: '700', fontSize: 16 }}>{task.title}</Text>
//       {task.description ? <Text>{task.description}</Text> : null}

//       {/* Priority Badge */}
//       <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
//         <Text style={{ fontWeight: '600', marginRight: 8 }}>Priority:</Text>
//         <View style={{
//           backgroundColor: getPriorityInfo(task.priority).color,
//           paddingHorizontal: 8,
//           paddingVertical: 2,
//           borderRadius: 12
//         }}>
//           <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
//             {getPriorityInfo(task.priority).label}
//           </Text>
//         </View>
//       </View>

//       {/* Action buttons */}
//       <View style={{ flexDirection: 'row', marginTop: 12 }}>
//         <TouchableOpacity onPress={onEdit}><Text>✏️ Edit</Text></TouchableOpacity>
//         <TouchableOpacity onPress={onDelete} style={{ marginLeft: 12 }}><Text>🗑️ Delete</Text></TouchableOpacity>
//       </View>
//     </View>
//   );
// };
