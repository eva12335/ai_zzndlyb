/**
 * ROI 利润分析页
 * 来源：PRD §5-6 完整实现
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { FS } from '../../constants/fonts';
import { useProjectStore } from '../../store/useProjectStore';
import { useCalculation } from '../../hooks/useCalculation';
import ProjectNameCard from '../../components/roi/ProjectNameCard';
import CostStructureCard from '../../components/roi/CostStructureCard';
import PricingVolumeCard from '../../components/roi/PricingVolumeCard';
import ServiceRateCard from '../../components/roi/ServiceRateCard';
import GeneralSettingsCard from '../../components/roi/GeneralSettingsCard';
import TargetProfitCard from '../../components/roi/TargetProfitCard';
import KpiCards from '../../components/roi/KpiCards';
import SliderGroup from '../../components/roi/SliderGroup';
import BreakEvenChart from '../../components/roi/BreakEvenChart';
import ReportTabs from '../../components/roi/ReportTabs';
import ProfitDiagnosticCard from '../../components/roi/ProfitDiagnosticCard';
import CapacityWarning from '../../components/roi/CapacityWarning';
import ExportActions from '../../components/shared/ExportActions';
import ShareCard from '../../components/shared/ShareCard';
import SaveProjectBtn from '../../components/shared/SaveProjectBtn';
import TabBar from '../../components/layout/TabBar';

export default function RoiPage() {
  const { t } = useTranslation();
  const mode = useProjectStore((s) => s.mode);
  const setMode = useProjectStore((s) => s.setMode);
  const store = useProjectStore();

  const calc = useCalculation();

  const isService = mode === 'service';
  const [showShare, setShowShare] = useState(false);
  const [inputCollapsed, setInputCollapsed] = useState(false);

  const hasResult = !!(calc.breakEven && calc.profitLoss && calc.cashFlow);
  const VC = new Decimal(store.unitVariableCost);
  const U = calc.derivedU ?? new Decimal(0);
  const V = calc.derivedV ?? new Decimal(0);

  useEffect(() => {
    if (calc.profitLoss) {
      store.setField('netProfit', calc.profitLoss.netProfit.toNumber());
    }
  }, [calc.profitLoss]);

  return (
    <View style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScrollView style={{ flex: 1 }} scrollY>

      {/* 模式切换 */}
      <View style={{ display: 'flex', marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <View onClick={() => setMode('product')} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: FS.label, fontWeight: 600, background: mode === 'product' ? '#162340' : 'var(--surface)', color: mode === 'product' ? '#f0ece4' : 'var(--text-muted)' }}>{t('roi.mode_product_btn')}</View>
        <View onClick={() => setMode('service')} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: FS.label, fontWeight: 600, background: mode === 'service' ? '#162340' : 'var(--surface)', color: mode === 'service' ? '#f0ece4' : 'var(--text-muted)' }}>{t('roi.mode_service_btn')}</View>
      </View>

      {/* 成本输入折叠区 */}
      <View
        onClick={() => setInputCollapsed(!inputCollapsed)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px', borderRadius: '12px', marginBottom: inputCollapsed ? '12px' : '8px',
          background: '#162340',
        }}
      >
        <Text style={{ fontSize: FS.label, fontWeight: 600, color: '#f0ece4' }}>
          {t('roi.cost_input_title')}
        </Text>
        <Text style={{ fontSize: FS.caption, color: '#f0ece4' }}>
          {inputCollapsed ? '▼ 展开' : '▲ 收起'}
        </Text>
      </View>

      {!inputCollapsed && (
        <>
          <ProjectNameCard />
          <CostStructureCard />
          <PricingVolumeCard />
          <ServiceRateCard
            breakEvenHourlyRate={calc.breakEvenHourlyRate ?? null}
            requiredPrice={calc.breakEven?.requiredPrice ?? null}
          />
          <TargetProfitCard
            requiredVolume={calc.breakEven?.requiredVolume ?? null}
            requiredPrice={calc.breakEven?.requiredPrice ?? null}
          />
          <GeneralSettingsCard />
        </>
      )}

      {/* 校验错误 */}
      {calc.validation && !calc.validation.pass && calc.validation.errors.length > 0 && (
        <View style={{ padding: '12px', background: 'rgba(212,117,99,0.06)', borderRadius: '10px', border: '1px solid rgba(212,117,99,0.2)', marginBottom: '12px' }}>
          {calc.validation.errors.map((e, i) => (
            <Text key={i} style={{ fontSize: FS.caption, color: 'var(--red)', display: 'block', marginBottom: '2px' }}>⚠️ {e.msg}</Text>
          ))}
        </View>
      )}

      {/* 校验警告 */}
      {calc.validation && calc.validation.warnings.length > 0 && (
        <View style={{ padding: '12px', background: 'rgba(224,136,58,0.06)', borderRadius: '10px', border: '1px solid rgba(224,136,58,0.2)', marginBottom: '12px' }}>
          {calc.validation.warnings.map((w, i) => (
            <Text key={i} style={{ fontSize: FS.caption, color: 'var(--warm)', display: 'block', marginBottom: '2px' }}>⚠️ {w.msg}</Text>
          ))}
        </View>
      )}

      {/* 结果区 */}
      {hasResult && (
        <>
          <KpiCards
            netProfit={calc.profitLoss!.netProfit}
            operatingProfit={calc.profitLoss!.operatingProfit}
            breakEven={calc.breakEven}
            currentVolume={V}
          />
          <SliderGroup />
          <BreakEvenChart
            breakEvenVolume={calc.breakEven!.breakEvenVolume}
            breakEvenRevenue={calc.breakEven!.breakEvenRevenue}
            unitPrice={U}
            unitVariableCost={VC}
            fixedCost={new Decimal(store.fixedCost).plus(store.tokenCost)}
            volume={V}
            projection={calc.projection ?? undefined}
          />
          <CapacityWarning volume={V} />
          <ReportTabs
            profitLoss={calc.profitLoss!}
            cashFlow={calc.cashFlow!}
            paymentCycle={store.paymentCycle}
            startupCapital={new Decimal(store.startupCapital)}
          />
          <ExportActions
            onShare={() => setShowShare(!showShare)}
          />
          {showShare && (
            <ShareCard
              projectName={store.projectName}
              unitPrice={U}
              breakEven={calc.breakEven!}
              profitLoss={calc.profitLoss!}
              cashFlow={calc.cashFlow!}
              projection={calc.projection ?? null}
              diagnostic={calc.diagnostic ?? null}
              isService={isService}
            />
          )}
          {calc.diagnostic && <ProfitDiagnosticCard diagnostic={calc.diagnostic} />}
          <SaveProjectBtn />
        </>
      )}

      </ScrollView>
      <TabBar />
    </View>
  );
}
