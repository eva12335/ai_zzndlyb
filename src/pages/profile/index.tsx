/**
 * 个人中心页
 * 来源：TECH_DESIGN §3.6 · PRD §5
 *
 * 结构：资料卡片 → 数据统计 → 菜单列表 → TabBar
 * 菜单项包含可交互项（测评导航、Toast 提示）和静态展示项（语言、关于）
 */
import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Taro from '@tarojs/taro';
import { FS } from '../../constants/fonts';
import TabBar from '../../components/layout/TabBar';
import ProfileCard from '../../components/profile/ProfileCard';
import ProfileEditor from '../../components/profile/ProfileEditor';
import { useUserStore } from '../../store/useUserStore';
import { useProjectStore, type SavedProject } from '../../store/useProjectStore';

export default function ProfilePage() {
  Taro.useShareAppMessage(() => {
    return {
      title: 'OPC创业罗盘 — 你的创业决策工具箱',
      path: '/pages/profile/index',
    };
  });

  Taro.useShareTimeline(() => {
    return {
      title: 'OPC创业罗盘 — 你的创业决策工具箱',
    };
  });

  const { t } = useTranslation();
  const [editorVisible, setEditorVisible] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const assessmentCount = useUserStore((s) => s.assessmentCount);
  const analysisCount = useUserStore((s) => s.analysisCount);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const loadProject = useProjectStore((s) => s.loadProject);

  // 展开项目列表时刷新数据
  useEffect(() => {
    if (showProjects) {
      setProjects(loadProjects());
    }
  }, [showProjects, loadProjects]);

  // 菜单项配置：集中管理路由与交互逻辑
  const menuItems = [
    {
      icon: '',
      label: '我的项目',
      sub: '本地保存',
      onClick: () => {
        setShowProjects(!showProjects);
      },
    },
    {
      icon: '',
      label: '历史测评',
      sub: '',
      onClick: () => {
        Taro.switchTab({ url: '/pages/assessment/index' });
      },
    },
    {
      icon: '',
      label: '语言',
      sub: t('profile.language_value'),
      onClick: undefined,
    },
    {
      icon: '',
      label: '关于',
      sub: t('profile.about_value'),
      onClick: undefined,
    },
  ];

  return (
    <View style={{ padding: '16px', paddingBottom: '80px' }}>

      {/* 个人资料卡片 */}
      <View style={{ marginBottom: '16px' }}>
        <ProfileCard onEditProfile={() => setEditorVisible(true)} />
      </View>

      {/* 数据统计行 */}
      <View
        style={{
          display: 'flex',
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          padding: '16px 8px',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {[
          { value: String(loadProjects().length), unit: t('profile.stats_projects') },
          { value: String(assessmentCount), unit: t('profile.stats_assessments') },
          { value: String(analysisCount), unit: t('profile.stats_analyses') },
        ].map((stat, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRight: i < 2 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <Text
              style={{
                fontSize: FS.kpi,
                fontWeight: 700,
                color: 'var(--navy-deep)',
                display: 'block',
              }}
            >
              {stat.value}
            </Text>
            <Text
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}
            >
              {stat.unit}
            </Text>
          </View>
        ))}
      </View>

      {/* 菜单列表 */}
      <View
        style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {menuItems.map((item, i) => (
          <View
            key={i}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            {item.icon ? <Text style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</Text> : null}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  display: 'block',
                }}
              >
                {item.label}
              </Text>
              {item.sub ? (
                <Text style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {item.sub}
                </Text>
              ) : null}
            </View>
            {item.rightSlot ? item.rightSlot : null}
          </View>
        ))}
      </View>

      {/* 我的项目列表（点击菜单项展开/收起） */}
      {showProjects && (
        <View
          style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '4px 0',
            marginTop: '12px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {projects.length === 0 ? (
            <View style={{ padding: '24px 16px', textAlign: 'center' }}>
              <Text style={{ fontSize: FS.body, color: 'var(--text-muted)' }}>
                {t('profile.project_empty')}
              </Text>
              <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                {t('profile.project_empty_hint')}
              </Text>
            </View>
          ) : (
            projects.map((project) => (
              <View
                key={project.id}
                onClick={() => {
                  loadProject(project.id);
                  Taro.switchTab({ url: '/pages/roi/index' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderTop: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                {/* 模式图标 */}
                <Text style={{ fontSize: '20px', flexShrink: 0 }}>
                  {project.mode === 'product' ? '🏪' : '💼'}
                </Text>

                {/* 项目信息 */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {project.name}
                  </Text>
                  <Text style={{ fontSize: FS.caption, color: 'var(--text-muted)' }}>
                    {project.createdAt.slice(0, 10)}
                  </Text>
                </View>

                {/* 净利快照 */}
                {project.netProfit != null && (
                  <Text
                    style={{
                      fontSize: FS.label,
                      fontWeight: 600,
                      color: project.netProfit >= 0 ? 'var(--green)' : 'var(--red)',
                      flexShrink: 0,
                    }}
                  >
                    ¥{project.netProfit.toLocaleString()}
                  </Text>
                )}

                {/* 删除按钮 */}
                <View
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                    setProjects(loadProjects());
                  }}
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '14px',
                    background: 'var(--border-subtle)',
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '28px' }}>
                    ✕
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 资料编辑弹窗 */}
      <ProfileEditor
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
      />

      <TabBar />
    </View>
  );
}
