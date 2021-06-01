import { useEffect, useState } from 'react';
import { Grid, Button, Balloon } from '@alifd/next';
import { ipcRenderer } from 'electron';
import PageHeader from '@/components/PageHeader';
import { IBasePackage } from '@/interfaces';
import styles from './index.module.scss';
import store from './store';
import InstallStep from './components/InstallStep';

const { Row, Col } = Grid;

const Node = () => {
  const [installNodeStepVisible, setInstallNodeStepVisible] = useState(false);

  const [state, dispatchers] = store.useModel('node');
  const { nodeInfo, currentStep } = state;
  const { options = {}, localVersion, managerVersion } = nodeInfo as IBasePackage;
  const { managerName } = options;

  const INSTALL_NODE_CHANNEL = 'install-node';

  const onSwitchVersionBtnClick = () => {
    dispatchers.initStep();
    dispatchers.initNodeInstall();
    setInstallNodeStepVisible(true);
  };

  const getNodeInfo = async function () {
    await dispatchers.getNodeInfo();
  };

  useEffect(() => {
    getNodeInfo();
  }, []);

  const goBack = async () => {
    setInstallNodeStepVisible(false);
    await getNodeInfo();
  };

  const cancelNodeInstall = async () => {
    await ipcRenderer.invoke(
      'cancel-install-node',
      INSTALL_NODE_CHANNEL,
    );
    goBack();
  };

  const headerBtn = (currentStep !== 3 && installNodeStepVisible) ? (
    <Button type="normal" onClick={cancelNodeInstall}>
      取消安装
    </Button>
  ) : null;

  const switchNodeVersionBtn = (
    <Button
      text
      type="primary"
      disabled={!managerVersion}
      className={styles.switchVersionBtn}
      onClick={onSwitchVersionBtnClick}
    >
      切换版本
    </Button>
  );
  return (
    <div className={styles.nodeContainer}>
      <PageHeader title="Node 管理" button={headerBtn} />
      {
        installNodeStepVisible ? (
          <InstallStep
            managerName={managerName}
            INSTALL_NODE_CHANNEL={INSTALL_NODE_CHANNEL}
            goBack={goBack}
          />
        ) : (
          <Row className={styles.row}>
            <Col span={12}>
              <div className={styles.subTitle}>Node 版本</div>
            </Col>
            <Col span={12} className={styles.col}>
              {localVersion || 'Not Found'}
              {!managerVersion ? (
                <Balloon trigger={switchNodeVersionBtn}>
                  请在首页安装 NVM 以更好安装和管理 Node 版本。
                </Balloon>
              ) : (
                <>{switchNodeVersionBtn}</>)
              }
            </Col>
          </Row>
        )
      }
    </div>
  );
};

export default Node;